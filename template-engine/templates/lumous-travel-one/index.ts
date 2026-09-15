import type { TemplateModule } from "@/templates/types"

import {
  designSchema,
  defaultDesign,
  type LumousTravelOneDesign,
} from "./schema"

import { meta } from "./meta"
import {
  contentSchema,
  defaultContent,
  type LumousTravelOneContent,
} from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<
  LumousTravelOneContent,
  LumousTravelOneDesign
> = {
  meta,
  contentSchema,
  defaultContent,
  designSchema,
  defaultDesign,
  Template,
}
