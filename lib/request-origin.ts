export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedHost = firstHeaderValue(
    request.headers.get("x-forwarded-host")
  )
  if (!forwardedHost) return url.origin

  const forwardedProto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    url.protocol.slice(0, -1)

  return `${forwardedProto}://${forwardedHost}`
}

// Proxy chains append comma-separated values; the first is the client-facing one.
function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim()
  return first || null
}
