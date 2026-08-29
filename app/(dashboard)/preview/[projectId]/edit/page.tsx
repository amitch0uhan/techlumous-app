import { notFound } from "next/navigation"

import { ProjectEditorWorkspace } from "@/components/project-editor-workspace"
import { getProject } from "@/services/project"
import { getTemplateById } from "@/services/template"
import { getUserIntegrationByProvider } from "@/services/user-integration"

function hasContent(
  value: Record<string, unknown> | null | undefined
): value is Record<string, unknown> {
  return value !== null && Object.keys(value || {}).length > 0
}

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const template = project.template_id
    ? await getTemplateById(project.template_id)
    : null
  const integration = await getUserIntegrationByProvider({
    validateToken: false,
  })
  const initialContent =
    [project.draft_content, project.published_content].find(hasContent) ??
    template?.default_content ??
    {}

  return (
    <div className="sm:-m-4 lg:-m-6">
      <ProjectEditorWorkspace
        projectId={project.id}
        projectName={project.name}
        hasLiveDeployment={
          project.deploy_status === "ready" &&
          !!project.vercel_project_id &&
          !!project.deployment_url
        }
        initialPublishedContent={project.published_content}
        initialDeployment={{
          status: project.deploy_status ?? "not_deployed",
          liveUrl: project.deployment_url,
          inspectorUrl: null,
          errorText: project.deploy_error,
          lastDeployedAt: project.last_deployed_at,
        }}
        isVercelConnected={integration?.status === "CONNECTED"}
        template={
          template
            ? {
                name: template.name,
                slug: template.slug,
                initialContent,
              }
            : null
        }
      />
    </div>
  )
}
