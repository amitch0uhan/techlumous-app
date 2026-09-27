import { Fragment } from "react"

/** Splits text into word spans so the scroll scrubs can fade them one by one. */
export function Words({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 ? " " : null}
          <span data-word className="inline-block">
            {word}
          </span>
        </Fragment>
      ))}
    </>
  )
}
