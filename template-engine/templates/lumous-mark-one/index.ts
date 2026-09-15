import type { TemplateModule } from "@/templates/types"

import { designSchema, defaultDesign, type LumousMarkOneDesign } from "./schema"

import { meta } from "./meta"
import {
  contentSchema,
  defaultContent,
  type LumousMarkOneContent,
} from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<
  LumousMarkOneContent,
  LumousMarkOneDesign
> = {
  meta,
  contentSchema,
  defaultContent,
  designSchema,
  defaultDesign,
  Template,
}
