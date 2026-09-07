export type WidgetId =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "select"
  | "group"
  | "array"
  | "switch"
  | "color"

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
  collapsed?: boolean
}

export interface WidgetProps {
  field: FieldDescriptor
  fieldPath: string[]
  projectId?: string
  value: unknown
  onChange: (next: unknown) => void
}
