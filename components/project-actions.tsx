import { CreateProjectDrawer } from "@/components/create-project-drawer"
import type { Project } from "@/services/project.schema"
import type { Template } from "@/services/template.schema"

interface ProjectActionsProps {
  projectsPromise: Promise<Project[]>
  templatesPromise: Promise<Template[]>
}

export async function ProjectActions({
  projectsPromise,
  templatesPromise,
}: ProjectActionsProps) {
  const [projects, templates] = await Promise.all([
    projectsPromise,
    templatesPromise,
  ])

  if (projects.length === 0) return null

  return <CreateProjectDrawer buttonVariant="icon" templates={templates} />
}
