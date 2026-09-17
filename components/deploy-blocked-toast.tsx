import { toast } from "sonner"

import type { SchemaIssue } from "@/lib/schema-form"

const TOAST_ID = "deploy-blocked"
const MAX_VISIBLE_FIELDS = 5

export interface InvalidField extends SchemaIssue {
  section: "Content" | "Design"
}

type ReleaseAction = "deploying" | "publishing"

export function showInvalidFieldsToast(
  fields: InvalidField[],
  action: ReleaseAction
) {
  if (fields.length === 0) {
    toast.error(`Fix invalid content before ${action}`, {
      id: TOAST_ID,
      description:
        "This template's schema couldn't be loaded, so its content can't be checked. Reload the page and try again.",
    })
    return
  }

  const visible = fields.slice(0, MAX_VISIBLE_FIELDS)
  const hiddenCount = fields.length - visible.length

  toast.error(
    `Fix ${fields.length} invalid ${fields.length === 1 ? "field" : "fields"} before ${action}`,
    {
      id: TOAST_ID,
      duration: 10_000,
      description: (
        <ul className="mt-1 flex flex-col gap-1.5">
          {visible.map((field, index) => (
            <li key={`${field.section}:${field.path}:${index}`}>
              <span className="block font-medium text-foreground">
                {field.section}
                {field.label ? ` › ${field.label}` : ""}
              </span>
              <span className="block">{field.message}</span>
            </li>
          ))}
          {hiddenCount > 0 && <li>and {hiddenCount} more</li>}
        </ul>
      ),
    }
  )
}

export function showVercelReconnectToast() {
  toast.error("Reconnect Vercel before deploying", {
    id: TOAST_ID,
    description:
      "Your Vercel connection is missing or has expired. Reconnect it from the Integrations page, then deploy again.",
  })
}
