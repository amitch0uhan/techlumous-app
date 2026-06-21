import type { TemplateModule } from "@/templates/types"

import { helloWorld } from "./hello-world"

/**
 * A registered template with its content type erased. Templates are
 * contravariant in their content, so the registry holds them at `any` and
 * each template stays internally type-safe against its own schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplateModule = TemplateModule<any>

/**
 * Single source of truth mapping slug -> template module.
 * Add a template by importing its module and adding it here; the renderer
 * route and build API pick it up automatically.
 */
export const templates: Record<string, AnyTemplateModule> = {
  [helloWorld.meta.slug]: helloWorld,
}

export function getTemplate(slug: string): AnyTemplateModule | undefined {
  return templates[slug]
}

export function listTemplates(): AnyTemplateModule[] {
  return Object.values(templates)
}
