import { Suspense } from "react"

import { IntegrationContent } from "@/components/integration-content"
import { IntegrationListSkeleton } from "@/components/integration-card-skeleton"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <div className="page">
      <h1>Integrations</h1>
      <Suspense fallback={<IntegrationListSkeleton />}>
        <IntegrationContent />
      </Suspense>
    </div>
  )
}
