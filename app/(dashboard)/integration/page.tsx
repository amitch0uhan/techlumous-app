import { Suspense } from "react"

import { IntegrationListSkeleton } from "@/components/integration-card-skeleton"
import { IntegrationContent } from "@/components/integration-content"

export default async function Page() {
  return (
    <div className="page">
      <h1>Integrations</h1>
      <Suspense fallback={<IntegrationListSkeleton />}>
        <IntegrationContent />
      </Suspense>
    </div>
  )
}
