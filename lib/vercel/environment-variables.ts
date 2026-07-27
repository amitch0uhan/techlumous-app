import { vercelRequest } from "./api"

export const DEPLOYMENT_ENVIRONMENT_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "PROJECT_ID",
  "TEMPLATE_SLUG",
] as const

export type DeploymentEnvironmentKey =
  (typeof DEPLOYMENT_ENVIRONMENT_KEYS)[number]

export type DeploymentEnvironmentVariables = Record<
  DeploymentEnvironmentKey,
  string
>

export interface UpsertProjectEnvironmentVariablesParams {
  token: string
  projectId: string
  variables: DeploymentEnvironmentVariables
  teamId?: string
  requestTimeoutMs?: number
  maxRetries?: number
}

const TARGETS = ["production", "preview", "development"] as const

/**
 * Creates or updates the four deployment environment variables required by
 * the template engine. Values are sent to Vercel but never returned or logged.
 */
export async function upsertProjectEnvironmentVariables(
  params: UpsertProjectEnvironmentVariablesParams
): Promise<void> {
  if (!params.projectId.trim()) {
    throw new Error("A Vercel project ID is required")
  }

  for (const key of DEPLOYMENT_ENVIRONMENT_KEYS) {
    if (!params.variables[key]) {
      throw new Error(`A value for ${key} is required`)
    }
  }

  const body = DEPLOYMENT_ENVIRONMENT_KEYS.map((key) => {
    return {
      key,
      value: params.variables[key],
      type: "encrypted",
      target: TARGETS,
    }
  })

  await vercelRequest({
    ...params,
    path: `/v10/projects/${encodeURIComponent(params.projectId)}/env?upsert=true`,
    operation: "environment variable upsert",
    method: "POST",
    body,
  })
}
