import type { TemplateModule } from "@/templates/types"

import { template as lumousStudioOne } from "./lumous-studio-one"
import { template as lumousTravelOne } from "./lumous-travel-one"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplateModule = TemplateModule<any, any>

export const templates: Record<string, AnyTemplateModule> = {
  [lumousStudioOne.meta.slug]: lumousStudioOne,
  [lumousTravelOne.meta.slug]: lumousTravelOne,
}

export function getTemplate(slug: string): AnyTemplateModule | undefined {
  return templates[slug]
}

export function listTemplates(): AnyTemplateModule[] {
  return Object.values(templates)
}
