import { Suspense } from "react"

import { TemplateListSkeleton } from "@/components/template-card-skeleton"
import { TemplatesList } from "@/components/templates-list"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  return (
    <div className="page">
      <h1>Templates</h1>
      <Suspense fallback={<TemplateListSkeleton />}>
        <TemplatesList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
