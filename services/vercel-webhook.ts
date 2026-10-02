import { createAdminClient } from "@/lib/supabase/server"
import { getDeploymentStatus, getPublicUrl } from "@/lib/vercel/deploy"
import type { VercelDeploymentEvent } from "@/lib/webhooks/vercel/event"
import {
  buildVercelEventOrderFilter,
  buildVercelProjectUpdate,
  shouldProcessVercelEvent,
} from "@/lib/webhooks/vercel/state"
import { getVercelCredentialsByUserId } from "@/services/user-integration"

const TABLE = "projects"
const PUBLIC_URL_REQUEST_TIMEOUT_MS = 10_000

export type VercelWebhookProcessingResult = "processed" | "ignored"

/**
 * Webhook payloads only carry the aliases known at creation time, which are
 * protected generated hosts. The production domain is attached once the
 * deployment is ready, so it is read from the live deployment instead.
 */
async function resolvePublicUrl(
  event: VercelDeploymentEvent,
  userId: string | null
): Promise<string | null> {
  if (event.status !== "ready" || !userId) return null

  try {
    const credentials = await getVercelCredentialsByUserId(userId)
    if (!credentials) return null

    const deployment = await getDeploymentStatus(
      { ...credentials, requestTimeoutMs: PUBLIC_URL_REQUEST_TIMEOUT_MS },
      event.deploymentId
    )
    return getPublicUrl(deployment) ?? null
  } catch (error) {
    console.error("Failed to resolve public URL for Vercel deployment", error)
    return null
  }
}

export async function processVercelDeploymentEvent(
  event: VercelDeploymentEvent
): Promise<VercelWebhookProcessingResult> {
  const supabase = await createAdminClient()

  const { data: project, error: lookupError } = await supabase
    .from(TABLE)
    .select("id, user_id, last_deployed_at")
    .eq("vercel_project_id", event.projectId)
    .maybeSingle()

  if (lookupError) {
    throw new Error(
      `Failed to locate project for Vercel event: ${lookupError.message}`
    )
  }
  if (
    !project ||
    !shouldProcessVercelEvent(project.last_deployed_at, event.createdAt)
  ) {
    return "ignored"
  }

  const publicUrl = await resolvePublicUrl(event, project.user_id)

  const { data, error } = await supabase
    .from(TABLE)
    .update(buildVercelProjectUpdate(event, publicUrl))
    .eq("id", project.id)
    .eq("vercel_project_id", event.projectId)
    .or(buildVercelEventOrderFilter(event.createdAt))
    .select("id")

  if (error) {
    throw new Error(
      `Failed to process Vercel deployment event: ${error.message}`
    )
  }

  return data.length === 0 ? "ignored" : "processed"
}
