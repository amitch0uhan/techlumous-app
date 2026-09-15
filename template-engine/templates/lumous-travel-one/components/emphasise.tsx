import type { ReactNode } from "react"

/** Renders *asterisk pairs* as bright inline runs against the dimmed line. */
export function emphasise(value: unknown): ReactNode {
  const source = typeof value === "string" ? value : ""
  if (!source.includes("*")) return source
  return source.split(/\*([^*]+)\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="text-lt-heading font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  )
}
