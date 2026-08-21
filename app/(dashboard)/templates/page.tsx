import { Suspense } from "react"
import { redirect } from "next/navigation"

import { TemplateListSkeleton } from "@/components/template-card-skeleton"
import { TemplatesList } from "@/components/templates-list"
import { createClient } from "@/lib/supabase/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

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
