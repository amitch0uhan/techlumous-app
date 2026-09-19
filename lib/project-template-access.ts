import "server-only"

import { z } from "zod"

import { getProject } from "@/services/project"
import type { Project } from "@/services/project.schema"

export type ProjectTemplateState =
  | { kind: "invalid" }
  | { kind: "unselected"; project: Project }
  | { kind: "selected"; project: Project }
  | { kind: "mismatch"; project: Project }

// Reads the session via cookies, so it must never be wrapped in "use cache".
export async function getProjectTemplateState(
  projectId: string,
  templateId: string,
  userId: string
): Promise<ProjectTemplateState> {
  if (!z.uuid().safeParse(projectId).success) return { kind: "invalid" }

  const project = await getProject(projectId)
  if (!project || project.user_id !== userId) return { kind: "invalid" }

  if (!project.template_id) return { kind: "unselected", project }
  if (project.template_id === templateId) return { kind: "selected", project }
  return { kind: "mismatch", project }
}
