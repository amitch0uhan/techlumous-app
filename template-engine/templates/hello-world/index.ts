import type { TemplateModule } from "@/templates/types"

import { designSchema, defaultDesign, type HelloWorldDesign } from "./schema"

import { meta } from "./meta"
import { contentSchema, defaultContent, type HelloWorldContent } from "./schema"
import { Template } from "./Template"

// Every template exports `template` — the uniform name lets the deploy
// pipeline generate a single-template registry from just the slug.
export const template: TemplateModule<HelloWorldContent, HelloWorldDesign> = {
  meta,
  contentSchema,
  defaultContent,
  designSchema,
  defaultDesign,
  Template,
}
