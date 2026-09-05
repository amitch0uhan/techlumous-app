import { Suspense } from "react"

import { DesktopRequiredToast } from "@/components/desktop-required-toast"
import { ProjectActions } from "@/components/project-actions"
import { ProjectList } from "@/components/project-list"
import { ProjectListSkeleton } from "@/components/project-card-skeleton"
import { listProjects } from "@/services/project"
import { listTemplates } from "@/services/template"

export default function Page() {
  const projectsPromise = listProjects()
  const templatesPromise = listTemplates()

  return (
    <div className="page">
      <Suspense fallback={null}>
        <DesktopRequiredToast />
      </Suspense>
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
