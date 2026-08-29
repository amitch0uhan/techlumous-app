import { Suspense } from "react"

import { TemplateListSkeleton } from "@/components/template-card-skeleton"
import { TemplatesList } from "@/components/templates-list"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project: projectId } = await searchParams

  return (
    <div className="page">
      <h1>Templates</h1>
      <Suspense fallback={<TemplateListSkeleton />}>
        <TemplatesList projectId={projectId} />
      </Suspense>
    </div>
  )
}
