import type { TemplateModule } from "@/templates/types"

import { meta } from "./meta"
import {
  contentSchema,
  defaultContent,
  defaultDesign,
  designSchema,
  type LumousStudioOneContent,
  type LumousStudioOneDesign,
} from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<
  LumousStudioOneContent,
  LumousStudioOneDesign
> = {
  meta,
  contentSchema,
  defaultContent,
  designSchema,
  defaultDesign,
  Template,
}
