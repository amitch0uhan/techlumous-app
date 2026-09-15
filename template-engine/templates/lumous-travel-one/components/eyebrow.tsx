import { trimmed } from "../lib"

/** Section number and label; colours follow the surface it sits on. */
export function Eyebrow({ index, label }: { index: string; label: unknown }) {
  return (
    <div className="font-lt-label text-lt-xs tracking-lt-eyebrow flex flex-col gap-1.5 font-extralight uppercase">
      {index.length > 0 ? (
        <span className="text-lt-subtle-foreground">{index}</span>
      ) : null}
      <span className="text-lt-foreground">{trimmed(label)}</span>
    </div>
  )
}
