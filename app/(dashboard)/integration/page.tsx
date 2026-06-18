import { IntegrationCard } from "@/components/integration-card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const integrations = [
  {
    name: "Stripe",
    description: "Accept payments and manage subscriptions seamlessly.",
    status: "connected" as const,
  },
  {
    name: "GitHub",
    description: "Sync your repositories and automate deployments.",
    status: "connected" as const,
  },
  {
    name: "Slack",
    description: "Send notifications and alerts to your team channels.",
    status: "disconnected" as const,
  },
  {
    name: "Google Analytics",
    description: "Track visitor behaviour and measure site performance.",
    status: "none" as const,
  },
  {
    name: "Mailchimp",
    description: "Manage email campaigns and grow your audience.",
    status: "disconnected" as const,
  },
  {
    name: "Shopify",
    description: "Connect your store and sync product and order data.",
    status: "none" as const,
  },
  {
    name: "Notion",
    description: "Keep your docs and project notes in sync automatically.",
    status: "connected" as const,
  },
  {
    name: "Figma",
    description: "Import design assets and keep your brand consistent.",
    status: "none" as const,
  },
  {
    name: "Zapier",
    description: "Automate workflows by connecting apps without code.",
    status: "disconnected" as const,
  },
]

export default async function Page() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <div className="page">
      <h1>Integrations</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} {...integration} />
        ))}
      </div>
    </div>
  )
}
