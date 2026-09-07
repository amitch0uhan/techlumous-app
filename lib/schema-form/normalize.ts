import type { ZodType } from "zod"

import type { FieldDescriptor, WidgetId } from "./types"

interface FieldMeta {
  label?: string
  widget?: WidgetId
  format?: string
  labelLayout?: "above" | "beside"
  collapsed?: boolean
}

export function normalize(schema: ZodType, key = ""): FieldDescriptor {
  const s = schema as any
  const meta = (s.meta?.() ?? {}) as FieldMeta
  const def = s.def
  const base = {
    key,
    label: meta.label,
    widget: meta.widget,
    format: meta.format,
    labelLayout: meta.labelLayout,
    collapsed: meta.collapsed,
  }

  switch (def.type as string) {
    case "object":
      return {
        ...base,
        kind: "object",
        fields: Object.entries(def.shape).map(([childKey, child]) =>
          normalize(child as ZodType, childKey)
        ),
      }
    case "array":
      return { ...base, kind: "array", item: normalize(def.element, "") }
    case "enum":
      return { ...base, kind: "enum", options: Object.values(def.entries) }
    case "number":
    case "int":
      return { ...base, kind: "number" }
    case "boolean":
      return { ...base, kind: "boolean" }
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "readonly": {
      // A wrapper carries its own `.meta()` only when the author put it there;
      // otherwise every editor hint falls through to the schema it wraps. All of
      // them must be forwarded — `z.object({...}).meta({...}).prefault({})` is a
      // normal shape, and dropping one here silently loses that hint.
      const inner = normalize(def.innerType, key)
      return {
        ...inner,
        key,
        label: base.label ?? inner.label,
        widget: base.widget ?? inner.widget,
        format: base.format ?? inner.format,
        labelLayout: base.labelLayout ?? inner.labelLayout,
        collapsed: base.collapsed ?? inner.collapsed,
      }
    }
    default:
      return { ...base, kind: "string" }
  }
}
