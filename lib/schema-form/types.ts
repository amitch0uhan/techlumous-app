export type WidgetId =
  "text" | "textarea" | "url" | "image" | "select" | "group" | "array"

export interface FieldDescriptor {
  key: string
  label?: string
  labelLayout?: "above" | "beside"
  kind: "string" | "number" | "boolean" | "object" | "array" | "enum"
  widget?: WidgetId
  format?: string
  options?: string[]
  fields?: FieldDescriptor[]
  item?: FieldDescriptor
}

export interface WidgetProps {
  field: FieldDescriptor
  value: unknown
  onChange: (next: unknown) => void
}
