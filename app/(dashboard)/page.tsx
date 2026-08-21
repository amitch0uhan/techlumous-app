import { Suspense } from "react"

import { ProjectActions } from "@/components/project-actions"
import { ProjectList } from "@/components/project-list"
import { ProjectListSkeleton } from "@/components/project-card-skeleton"
import { createClient } from "@/lib/supabase/server"
import { listProjects } from "@/services/project"
import { listTemplates } from "@/services/template"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  const projectsPromise = listProjects()
  const templatesPromise = listTemplates()

  return (
    <div className="page">
      <div className="flex items-center justify-between">
        <h1 className="max-sm:pl-2">Projects</h1>
        <Suspense fallback={null}>
          <ProjectActions
            projectsPromise={projectsPromise}
            templatesPromise={templatesPromise}
          />
        </Suspense>
      </div>
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList
          projectsPromise={projectsPromise}
          templatesPromise={templatesPromise}
        />
      </Suspense>
    </div>
  )
}
