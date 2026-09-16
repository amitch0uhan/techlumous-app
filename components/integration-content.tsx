import { disconnectIntegration } from "@/actions/integration"
import { connectVercel } from "@/actions/vercel"
import { IntegrationCard } from "@/components/integration-card"
import { listUserIntegrations } from "@/services/user-integration"
import type { UserIntegration } from "@/services/user-integration.schema"

function vercelCardStatus(
  integration: Omit<UserIntegration, "credentials" | "token"> | undefined
): "none" | "connected" | "disconnected" {
  if (integration?.status === "CONNECTED") return "connected"
  if (integration?.status === "DISCONNECTED") return "disconnected"
  return "none"
}

export async function IntegrationContent() {
  const integrations = await listUserIntegrations()

  // The Vercel card always renders; the user's row (if any) only drives its status.
  const status = vercelCardStatus(
    integrations.find((item) => item.provider === "vercel")
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <IntegrationCard
        name="Vercel"
        description="Deploy and manage your projects on Vercel."
        status={status}
        action={status === "connected" ? disconnectIntegration : connectVercel}
      />
    </div>
  )
}
