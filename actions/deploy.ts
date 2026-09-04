"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { getDeploymentStatus } from "@/lib/vercel/deploy"
import { getUserIntegrationByProvider } from "@/services/user-integration"
import { getVaultSecret } from "@/services/vault-secret"
import {
  getDeploymentState,
  syncDeploymentStatus,
  type DeploymentState,
} from "@/services/deployment"
import {
  orchestrateProjectDeployment,
  type DeploymentOrchestratorCode,
} from "@/services/deployment-orchestrator"
import type { DeploymentStatus } from "@/types/deployment"

const projectIdSchema = z.uuid()

function deploymentStatusFromReadyState(readyState: string): DeploymentStatus {
  switch (readyState.toUpperCase()) {
    case "QUEUED":
      return "queued"
    case "INITIALIZING":
      return "initializing"
    case "BUILDING":
      return "building"
    case "READY":
      return "ready"
    case "CANCELED":
      return "canceled"
    case "ERROR":
      return "error"
    default:
      throw new Error(`Unsupported Vercel deployment state: ${readyState}`)
  }
}

export type DeploymentActionSnapshot = {
  status: DeploymentStatus
  liveUrl: string | null
  inspectorUrl: string | null
  errorText: string | null
  lastDeployedAt: string | null
}

export type DeployProjectActionResult = {
  status: "success" | "error"
  code: DeploymentOrchestratorCode | "INVALID_PROJECT" | null
  message: string
  deployment: DeploymentActionSnapshot | null
}

function snapshot(
  deployment: DeploymentState | null,
  inspectorUrl: string | null = null
): DeploymentActionSnapshot | null {
  if (!deployment) return null

  return {
    status: deployment.deploy_status ?? "not_deployed",
    liveUrl: deployment.deployment_url,
    inspectorUrl,
    errorText: deployment.deploy_error,
    lastDeployedAt: deployment.last_deployed_at,
  }
}

export async function deployProjectAction(
  projectId: string
): Promise<DeployProjectActionResult> {
  const userId = await requireAuthenticatedUserId()
  if (!userId) {
    return {
      status: "error",
      code: "NOT_AUTHENTICATED",
      message: "Sign in before deploying this project.",
      deployment: null,
    }
  }

  const parsedProjectId = projectIdSchema.safeParse(projectId)
  if (!parsedProjectId.success) {
    return {
      status: "error",
      code: "INVALID_PROJECT",
      message: "Invalid project.",
      deployment: null,
    }
  }

  try {
    const result = await orchestrateProjectDeployment(parsedProjectId.data)
    revalidatePath(`/preview/${parsedProjectId.data}/edit`)
    revalidatePath("/")

    return {
      status: result.ok ? "success" : "error",
      code: result.code,
      message: result.message,
      deployment: snapshot(result.deployment, result.inspectorUrl),
    }
  } catch (error) {
    console.error("Failed to deploy project", error)
    return {
      status: "error",
      code: "DEPLOYMENT_FAILED",
      message: "Failed to start the deployment.",
      deployment: null,
    }
  }
}

export async function getProjectDeploymentAction(
  projectId: string
): Promise<DeploymentActionSnapshot | null> {
  const parsedProjectId = projectIdSchema.safeParse(projectId)
  if (!parsedProjectId.success) return null

  const userId = await requireAuthenticatedUserId()
  if (!userId) return null

  const deployment = await getDeploymentState(parsedProjectId.data, userId)
  return snapshot(deployment)
}

export type FetchDeploymentStatusActionResult =
  | {
      status: "success"
      response: Awaited<ReturnType<typeof getDeploymentStatus>>
      deployment: DeploymentActionSnapshot
    }
  | { status: "error"; message: string }

export async function fetchDeploymentStatusAction(
  projectId: string
): Promise<FetchDeploymentStatusActionResult> {
  const parsedProjectId = projectIdSchema.safeParse(projectId)
  if (!parsedProjectId.success) {
    return { status: "error", message: "Invalid project." }
  }

  try {
    const userId = await requireAuthenticatedUserId()
    if (!userId) return { status: "error", message: "Sign in to continue." }

    const deployment = await getDeploymentState(parsedProjectId.data, userId)
    if (!deployment?.vercel_deployment_id) {
      return { status: "error", message: "No Vercel deployment ID is stored." }
    }

    const integration = await getUserIntegrationByProvider({
      validateToken: false,
    })
    if (!integration || integration.status !== "CONNECTED") {
      return {
        status: "error",
        message: "Connect Vercel before checking status.",
      }
    }

    const token = await getVaultSecret(integration.token)
    if (!token)
      return { status: "error", message: "Vercel access token is missing." }

    const response = await getDeploymentStatus(
      {
        token,
        teamId:
          typeof integration.credentials?.team_id === "string"
            ? integration.credentials.team_id
            : undefined,
      },
      deployment.vercel_deployment_id
    )

    const deploymentStatus = deploymentStatusFromReadyState(response.readyState)
    const error =
      response.errorCode || response.errorMessage
        ? [response.errorCode, response.errorMessage].filter(Boolean).join(": ")
        : null
    const buildFinishedAt = response.buildContainerFinishedAt
      ? new Date(response.buildContainerFinishedAt).toISOString()
      : null

    const syncedDeployment = await syncDeploymentStatus(
      parsedProjectId.data,
      userId,
      {
        expectedDeploymentId: deployment.vercel_deployment_id,
        deploymentId: response.id,
        status: deploymentStatus,
        deploymentUrl: response.url
          ? response.url.startsWith("http")
            ? response.url
            : `https://${response.url}`
          : null,
        error,
        updatedAt: buildFinishedAt,
      }
    )
    if (!syncedDeployment) {
      return {
        status: "error",
        message: "Deployment status changed before the response was saved.",
      }
    }

    return {
      status: "success",
      response,
      deployment: snapshot(syncedDeployment, response.inspectorUrl ?? null)!,
    }
  } catch (error) {
    console.error("Failed to fetch deployment status", error)
    return {
      status: "error",
      message: "Failed to fetch the deployment status.",
    }
  }
}
