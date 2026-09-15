import type { ReactElement } from "react"
import type { ZodType } from "zod"

import type { TemplateCategory } from "./taxonomy"

export interface TemplateMeta {
  slug: string
  name: string
  version: string
  category: TemplateCategory
  tags: string[]
  description: string
  thumbnail: string

  status: "published" | "draft" | "deprecated"
}

export type TemplateComponent<TContent, TDesign> = (props: {
  content: TContent
  design: TDesign
}) => ReactElement

export interface TemplateModule<TContent = unknown, TDesign = unknown> {
  meta: TemplateMeta
  contentSchema: ZodType<TContent>
  designSchema: ZodType<TDesign>
  defaultDesign: TDesign
  defaultContent: TContent
  Template: TemplateComponent<TContent, TDesign>
}
