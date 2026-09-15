export const TEMPLATE_LIVE_CHANNEL = "techlumous:template-live" as const

export type TemplateLiveMessage =
  | {
      channel: typeof TEMPLATE_LIVE_CHANNEL
      type: "form-ready"
      slug: string
    }
  | {
      channel: typeof TEMPLATE_LIVE_CHANNEL
      type: "renderer-ready"
      slug: string
    }
  | {
      channel: typeof TEMPLATE_LIVE_CHANNEL
      type: "snapshot-update"
      slug: string
      content: unknown
      design: unknown
    }
  | {
      channel: typeof TEMPLATE_LIVE_CHANNEL
      type: "snapshot-applied"
      slug: string
    }

export function isTemplateLiveMessage(
  value: unknown
): value is TemplateLiveMessage {
  if (typeof value !== "object" || value === null) return false

  const message = value as {
    channel?: unknown
    type?: unknown
    slug?: unknown
  }

  return (
    message.channel === TEMPLATE_LIVE_CHANNEL &&
    typeof message.slug === "string" &&
    (message.type === "form-ready" ||
      message.type === "renderer-ready" ||
      (message.type === "snapshot-update" &&
        "content" in message &&
        "design" in message &&
        isRecord(message.content) &&
        isRecord(message.design)) ||
      message.type === "snapshot-applied")
  )
}

function isRecord(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}
