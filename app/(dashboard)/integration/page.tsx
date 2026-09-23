import { Suspense } from "react"

import { IntegrationListSkeleton } from "@/components/integration-card-skeleton"
import { IntegrationContent } from "@/components/integration-content"
import { IntegrationErrorToast } from "@/components/integration-error-toast"

export default async function Page() {
  return (
    <div className="page">
      <Suspense fallback={null}>
        <IntegrationErrorToast />
      </Suspense>
      <h1>Integrations</h1>
      <Suspense fallback={<IntegrationListSkeleton />}>
        <IntegrationContent />
      </Suspense>
    </div>
  )
}
