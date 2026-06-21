import type { ReactElement } from "react"

/** Static info about a template — safe to import anywhere (gallery, studio). */
export interface TemplateMeta {
  slug: string
  name: string
  type: string
}

/** A template is a pure function: content data -> rendered UI. */
export type TemplateComponent<TContent> = (props: {
  content: TContent
}) => ReactElement

/** Everything the renderer/build needs to produce a site for one template. */
export interface TemplateModule<TContent = unknown> {
  meta: TemplateMeta
  defaultContent: TContent
  Template: TemplateComponent<TContent>
}
