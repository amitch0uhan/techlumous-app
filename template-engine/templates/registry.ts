import type { TemplateModule } from "@/templates/types"

import { template as helloWorld } from "./hello-world"
import { template as lumousMarkOne } from "./lumous-mark-one"
import { template as lumousTravelOne } from "./lumous-travel-one"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplateModule = TemplateModule<any>

export const templates: Record<string, AnyTemplateModule> = {
  [helloWorld.meta.slug]: helloWorld,
  [lumousMarkOne.meta.slug]: lumousMarkOne,
  [lumousTravelOne.meta.slug]: lumousTravelOne,
}

export function getTemplate(slug: string): AnyTemplateModule | undefined {
  return templates[slug]
}

export function listTemplates(): AnyTemplateModule[] {
  return Object.values(templates)
}
