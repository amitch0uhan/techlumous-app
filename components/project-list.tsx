import { CardSkeleton } from "@/components/card-skeleton"
import { CreateProjectDrawer } from "@/components/create-project-drawer"
import { ProjectCard } from "@/components/project-card"
import { getRequestDeviceCapabilities } from "@/lib/device-capabilities.server"
import { getBlurDataURL } from "@/lib/image-placeholder"
import { cn } from "@/lib/utils"
import projectDefaultImage from "@/public/assets/project_default.png"
import type { Project } from "@/services/project.schema"
import type { Template } from "@/services/template.schema"

const SKELETON_TRANSFORMS = [
  "-rotate-3 z-10",
  "-translate-x-4 -translate-y-20 -rotate-1 opacity-40 scale-80",
  "translate-x-8 -translate-y-10 rotate-6 opacity-70 scale-90",
]

function cardStatus(deployStatus: Project["deploy_status"]) {
  return deployStatus?.trim().toLowerCase() || null
}

const createdAtFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

// "09 Sep, 2026" — DD MMM, YYYY
function formatCreatedAt(createdAt: Project["created_at"]) {
  if (!createdAt) return "—"
  const parts = createdAtFormat.formatToParts(new Date(createdAt))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""
  return `${get("day")} ${get("month")}, ${get("year")}`
}

interface ProjectListProps {
  projectsPromise: Promise<Project[]>
  templatesPromise: Promise<Template[]>
}

export async function ProjectList({
  projectsPromise,
  templatesPromise,
}: ProjectListProps) {
  const [projects, templates, capabilities] = await Promise.all([
    projectsPromise,
    templatesPromise,
    getRequestDeviceCapabilities(),
  ])

  const selectedTemplateForProject = projects.reduce(
    (acc, project) => {
      const template = templates.find((item) => item.id === project.template_id)
      if (template) acc[project.id] = template
      return acc
    },
    {} as Record<string, Template | undefined>
  )

  // Projects often share a template, so blur each distinct thumbnail once.
  const thumbnails = [
    ...new Set(
      Object.values(selectedTemplateForProject)
        .map((template) => template?.thumbnail)
        .filter((thumbnail): thumbnail is string => Boolean(thumbnail))
    ),
  ]
  const blurDataURLs = new Map(
    await Promise.all(
      thumbnails.map(
        async (thumbnail) =>
          [thumbnail, await getBlurDataURL(thumbnail)] as const
      )
    )
  )

  return (
    <>
      {projects.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-10 overflow-x-clip">
          <div className="isolate grid w-full max-w-md grid-cols-1 pt-20">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton
                key={index}
                className={cn(
                  "col-start-1 row-start-1",
                  SKELETON_TRANSFORMS[index]
                )}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground/60 max-sm:pl-2">
              No projects yet. How about creating a project to get started?
            </p>
            <CreateProjectDrawer templates={templates} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project, index) => {
            const thumbnail = selectedTemplateForProject[project.id]?.thumbnail
            return (
              <ProjectCard
                key={project.id}
                projectId={project.id}
                isTemplateSelected={!!project.template_id}
                image={thumbnail || projectDefaultImage}
                imageBlurDataURL={
                  thumbnail ? blurDataURLs.get(thumbnail) : undefined
                }
                // The first card sits directly under the page heading.
                imageLoading={index === 0 ? "eager" : undefined}
                name={project.name}
                url={project.deployment_url ?? "Not deployed"}
                status={cardStatus(project.deploy_status)}
                deploymentId={project.vercel_deployment_id}
                createdAt={formatCreatedAt(project.created_at)}
                websiteUrl={project.deployment_url}
                lastDeployedAt={project.last_deployed_at}
                canEditTemplate={capabilities.canEditProjects}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
