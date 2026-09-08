import { trimmed } from "../lib"

export function Eyebrow({
  index,
  label,
  onPanel = false,
}: {
  index: string
  label: unknown
  onPanel?: boolean
}) {
  return (
    <div className="font-lt-label text-lt-xs tracking-lt-eyebrow flex flex-col gap-1.5 font-extralight uppercase">
      {index.length > 0 ? (
        <span
          className={onPanel ? "text-lt-section-text/55" : "text-lt-subtle"}
        >
          {index}
        </span>
      ) : null}
      <span className={onPanel ? "text-lt-section-text" : "text-lt-body"}>
        {trimmed(label)}
      </span>
    </div>
  )
}
