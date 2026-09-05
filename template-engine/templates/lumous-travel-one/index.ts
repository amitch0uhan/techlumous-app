import type { TemplateModule } from "@/templates/types"

import { meta } from "./meta"
import {
  contentSchema,
  defaultContent,
  type LumousTravelOneContent,
} from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<LumousTravelOneContent> = {
  meta,
  contentSchema,
  defaultContent,
  Template,
}
