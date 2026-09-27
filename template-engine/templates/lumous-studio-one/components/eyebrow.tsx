import { trimmed } from "../lib"

/** Small uppercase label above a heading; colour follows its surface. */
export function Eyebrow({ label }: { label: unknown }) {
  const text = trimmed(label)
  if (text.length === 0) return null
  return (
    <p className="text-ls-eyebrow m-0 text-sm tracking-[0.04em] uppercase">
      {text}
    </p>
  )
}
