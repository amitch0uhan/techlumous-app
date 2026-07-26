const API = "https://api.vercel.com"

export type VercelEnvironmentTarget = "production" | "preview" | "development"

export type VercelEnvironmentVariableType = "plain" | "encrypted" | "sensitive"

export interface VercelEnvironmentVariableInput {
  key: string
  value: string
  type: VercelEnvironmentVariableType
  target: VercelEnvironmentTarget[]
  gitBranch?: string
  comment?: string
  customEnvironmentIds?: string[]
}

export interface VercelEnvironmentVariable extends Omit<
  VercelEnvironmentVariableInput,
  "value"
> {
  id: string
  value?: string
  createdAt?: number
  updatedAt?: number
  createdBy?: string
  updatedBy?: string | null
}

interface VercelEnvironmentVariableFailure {
  error: {
    code?: string
    message?: string
    key?: string
    envVarKey?: string
  }
}

interface VercelEnvironmentVariableMutationResponse {
  created: VercelEnvironmentVariable | VercelEnvironmentVariable[]
  failed?: VercelEnvironmentVariableFailure[]
}

export interface CreateProjectEnvironmentVariablesParams {
  token: string
  projectIdOrName: string
  variables: VercelEnvironmentVariableInput[]
  teamId?: string
  upsert?: boolean
}

export interface UpdateProjectEnvironmentVariableParams {
  token: string
  projectIdOrName: string
  environmentVariableId: string
  variable: Partial<VercelEnvironmentVariableInput>
  teamId?: string
}

interface VercelErrorResponse {
  error?: {
    code?: string
    message?: string
  }
}

function projectEnvironmentUrl(
  projectIdOrName: string,
  teamId?: string,
  suffix = "",
  upsert = false,
  version: "v9" | "v10" = "v10"
) {
  const query = new URLSearchParams()
  if (teamId) query.set("teamId", teamId)
  if (upsert) query.set("upsert", "true")

  const queryString = query.size > 0 ? `?${query.toString()}` : ""
  return `${API}/${version}/projects/${encodeURIComponent(projectIdOrName)}/env${suffix}${queryString}`
}

async function throwVercelEnvironmentError(
  response: Response,
  operation: string
): Promise<never> {
  let detail: VercelErrorResponse | undefined

  try {
    detail = (await response.json()) as VercelErrorResponse
  } catch {
    // Vercel can return a non-JSON response for upstream failures.
  }

  const code = detail?.error?.code
  const message = detail?.error?.message ?? response.statusText
  const codeLabel = code ? ` [${code}]` : ""

  throw new Error(
    `Vercel project environment variable ${operation} failed (${response.status})${codeLabel}: ${message}`
  )
}

function normalizeEnvironmentVariables(
  response: VercelEnvironmentVariable | VercelEnvironmentVariable[]
): VercelEnvironmentVariable[] {
  return Array.isArray(response) ? response : [response]
}

/**
 * Adds one or more project-level environment variables.
 * Set `upsert` to update matching variables instead of creating duplicates.
 */
export async function createProjectEnvironmentVariables({
  token,
  projectIdOrName,
  variables,
  teamId,
  upsert = false,
}: CreateProjectEnvironmentVariablesParams): Promise<
  VercelEnvironmentVariable[]
> {
  if (variables.length === 0) return []

  const response = await fetch(
    projectEnvironmentUrl(projectIdOrName, teamId, "", upsert),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    }
  )

  if (!response.ok) {
    await throwVercelEnvironmentError(response, upsert ? "upsert" : "create")
  }

  const result =
    (await response.json()) as VercelEnvironmentVariableMutationResponse
  if (result.failed && result.failed.length > 0) {
    const failures = result.failed
      .map(({ error }) => {
        const key = error.envVarKey ?? error.key ?? "unknown variable"
        return error.code ? `${key} [${error.code}]` : key
      })
      .join(", ")

    throw new Error(
      `Vercel project environment variable ${upsert ? "upsert" : "create"} partially failed: ${failures}`
    )
  }

  return normalizeEnvironmentVariables(result.created)
}

/** Updates one project-level environment variable by its Vercel env ID. */
export async function updateProjectEnvironmentVariable({
  token,
  projectIdOrName,
  environmentVariableId,
  variable,
  teamId,
}: UpdateProjectEnvironmentVariableParams): Promise<VercelEnvironmentVariable> {
  const response = await fetch(
    projectEnvironmentUrl(
      projectIdOrName,
      teamId,
      `/${encodeURIComponent(environmentVariableId)}`,
      false,
      "v9"
    ),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variable),
    }
  )

  if (!response.ok) {
    await throwVercelEnvironmentError(response, "update")
  }

  return (await response.json()) as VercelEnvironmentVariable
}
