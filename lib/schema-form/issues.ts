import type { core, ZodType } from "zod"

import { normalize } from "./normalize"
import type { FieldDescriptor } from "./types"

export interface SchemaIssue {
  path: string
  label: string
  message: string
}

type PathSegment = string | number

export function getSchemaIssues(
  schema: ZodType | undefined,
  value: unknown
): SchemaIssue[] {
  if (!schema) return []

  const result = schema.safeParse(value, { error: friendlyMessage })
  if (result.success) return []

  const root = normalize(schema)
  return result.error.issues.map((issue) => {
    const path = issue.path.filter(
      (segment): segment is PathSegment => typeof segment !== "symbol"
    )
    return {
      path: path.join("."),
      label: labelForPath(root, path),
      message: issue.message,
    }
  })
}

export function getSchemaErrors(
  schema: ZodType | undefined,
  value: unknown
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of getSchemaIssues(schema, value)) {
    errors[issue.path] ??= issue.message
  }
  return errors
}

// A message set on the schema itself still wins over this parse-level map.
function friendlyMessage(issue: core.$ZodRawIssue) {
  switch (issue.code) {
    case "invalid_type":
      return issue.input == null ? "Required" : `Expected ${issue.expected}`
    case "too_small": {
      const minimum = Number(issue.minimum)
      if (issue.origin === "array") {
        return `Add at least ${plural(minimum, "item")}`
      }
      if (issue.origin === "string") {
        return minimum <= 1
          ? "Required"
          : `Use at least ${plural(minimum, "character")}`
      }
      return undefined
    }
    case "too_big": {
      const maximum = Number(issue.maximum)
      if (issue.origin === "array") {
        return `Use at most ${plural(maximum, "item")}`
      }
      if (issue.origin === "string") {
        return `Use at most ${plural(maximum, "character")}`
      }
      return undefined
    }
    case "invalid_format":
      return `Enter a valid ${issue.format === "url" ? "URL" : issue.format}`
    case "invalid_value":
      return "Choose one of the available options"
    default:
      return undefined
  }
}

function labelForPath(root: FieldDescriptor, path: PathSegment[]) {
  const labels: string[] = []
  let field: FieldDescriptor | undefined = root

  for (const [index, segment] of path.entries()) {
    if (typeof segment === "number") {
      field = field?.item
      labels.push(`Item ${segment + 1}`)
      continue
    }

    field = field?.fields?.find((child) => child.key === segment)
    if (field?.label) labels.push(field.label)
    else if (index === path.length - 1) labels.push(humanize(segment))
  }

  return labels.join(" › ")
}

function humanize(key: string) {
  const words = key
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}
