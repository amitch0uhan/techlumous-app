import { connectVercel } from "@/actions/vercel"
import { disconnectIntegration } from "@/actions/integration"
import { IntegrationCard } from "@/components/integration-card"
import { getUserIntegrationByProvider } from "@/services/user-integration"
import type { UserIntegration } from "@/services/user-integration.schema"

function vercelCardStatus(
  integration: UserIntegration | null
): "none" | "connected" | "disconnected" {
  if (integration?.provider !== "vercel") return "none"
  if (integration.status === "CONNECTED") return "connected"
  if (integration.status === "DISCONNECTED") return "disconnected"
  return "none"
}

export async function IntegrationContent() {
  const integration = await getUserIntegrationByProvider()
  const status = vercelCardStatus(integration)

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
