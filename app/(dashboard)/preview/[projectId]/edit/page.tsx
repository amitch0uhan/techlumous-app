import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { EditorTopBarSkeleton } from "@/components/editor-top-bar-skeleton"
import { PreviewTemplateSkeleton } from "@/components/preview-skeleton"
import { ProjectEditorWorkspace } from "@/components/project-editor-workspace"
import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { getProject } from "@/services/project"
import { getTemplateById } from "@/services/template"
import { getUserIntegrationByProvider } from "@/services/user-integration"

function hasContent(
  value: Record<string, unknown> | null | undefined
): value is Record<string, unknown> {
  return value !== null && Object.keys(value || {}).length > 0
}

function ProjectEditorFallback() {
  return (
    <div className="relative isolate min-h-[calc(100dvh-4.2rem)]">
      <div aria-hidden="true" className="editor-workspace-grid" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.2rem)] w-full max-w-7xl flex-col gap-3 p-3">
        <EditorTopBarSkeleton />
        <PreviewTemplateSkeleton />
      </div>
    </div>
  )
}

export default function ProjectEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  return (
    <div className="sm:-m-4 lg:-m-6">
      <Suspense fallback={<ProjectEditorFallback />}>
        <ProjectEditor params={params} />
      </Suspense>
    </div>
  )
}

async function ProjectEditor({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  if (!z.uuid().safeParse(projectId).success) notFound()

  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")

  const project = await getProject(projectId)
  if (!project) notFound()
  if (!project.template_id) redirect(`/templates?project=${project.id}`)

  const [template, integration] = await Promise.all([
    getTemplateById(project.template_id),
    getUserIntegrationByProvider({
      validateToken: false,
    }),
  ])

  if (!template) redirect(`/templates?project=${project.id}`)

  const initialContent =
    [project.draft_content, project.published_content].find(hasContent) ??
    template?.default_content ??
    {}
  const initialDesign =
    [project.draft_design, project.published_design].find(hasContent) ??
    template?.default_design ??
    {}

  return (
    <ProjectEditorWorkspace
      projectId={project.id}
      projectName={project.name}
      hasLiveDeployment={
        project.deploy_status === "ready" &&
        !!project.vercel_project_id &&
        !!project.deployment_url
      }
      initialPublishedContent={project.published_content}
      initialPublishedDesign={project.published_design}
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
              initialDesign,
            }
          : null
      }
    />
  )
}
