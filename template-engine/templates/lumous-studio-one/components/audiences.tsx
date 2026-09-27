import {
  COLUMN,
  H2,
  join,
  list,
  record,
  SECTION_Y,
  toneAt,
  trimmed,
  type AudienceCard,
  type Content,
  type Tone,
} from "../lib"
import { ContentImage } from "./content-image"
import { Words } from "./words"

/** Card treatments in design order; longer lists repeat the cycle. */
const TONES: readonly Tone[] = ["card", "accent", "highlight", "light"]

function Tags({ tags }: { tags: string[] }) {
  const labels = tags.map(trimmed).filter((tag) => tag.length > 0)
  if (labels.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="border-ls-tag-border/65 text-ls-tag-foreground rounded-full border px-3 py-1.25 text-[13px] leading-[1.3] whitespace-nowrap"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export function Audiences({
  audiences,
  cards,
}: {
  audiences: unknown
  cards: AudienceCard[]
}) {
  const a = record<Content["audiences"]>(audiences)
  // Missing = shown, so content saved before the switch existed keeps images.
  const showImages = a.showImages !== false

  return (
    <section id="use-cases" className={join(COLUMN, SECTION_Y, "scroll-mt-20")}>
      <div
        data-reveal
        className="mb-[clamp(56px,8vw,120px)] grid justify-items-center gap-5 text-center"
      >
        <h2 data-heading-words className={H2}>
          <Words text={trimmed(a.heading)} />
        </h2>
        <p className="text-ls-foreground m-0 max-w-[36em] text-[clamp(16px,1.2vw,18px)] leading-[1.65] text-pretty">
          {trimmed(a.body)}
        </p>
      </div>

      {/* No base `grid-cols-1`: every template ships its own Tailwind, and a
          later copy of that utility would override the wide variant. One
          implicit column already fills the width. */}
      <div className="ls-wide:grid-cols-3 grid gap-[clamp(16px,1.6vw,24px)]">
        {cards.map((card, index) => {
          // The first card spans two columns, with its title at the top.
          const wide = index === 0
          const title = (
            <h3
              data-heading-words
              className="font-ls-display text-ls-heading m-0 text-[clamp(28px,2.4vw,38px)] leading-[1.1] font-medium tracking-[-0.02em]"
            >
              <Words text={trimmed(card?.title)} />
            </h3>
          )
          const details = (
            <>
              <Tags tags={list<string>(card?.tags)} />
              <p className="text-ls-foreground m-0 text-base leading-[1.65] text-pretty">
                {trimmed(card?.body)}
              </p>
            </>
          )
          return (
            <article
              key={index}
              data-reveal
              className={join(
                `ls-surface-${toneAt(TONES, index)}`,
                "bg-ls-background text-ls-heading border-ls-border/[0.08] group relative flex min-h-[clamp(360px,34vw,440px)] flex-col gap-[clamp(28px,3vw,48px)] overflow-hidden rounded-[28px] border p-[clamp(24px,2.4vw,32px)]",
                wide ? "ls-wide:col-span-2 justify-between" : "justify-end"
              )}
            >
              {showImages && trimmed(card?.imageUrl).length > 0 ? (
                // Held back so the artwork sits behind the copy; full strength on hover.
                <div
                  className={join(
                    "absolute top-0 right-0 z-0 opacity-50 transition-all duration-500 group-hover:scale-[102%] group-hover:opacity-100",
                    wide ? "bottom-0 w-[48%]" : "h-[45%] w-[65%]"
                  )}
                >
                  <ContentImage
                    src={card?.imageUrl}
                    alt={card?.imageAlt}
                    fit="contain"
                    placeholder={false}
                    sizes="(max-width: 1000px) 65vw, 420px"
                  />
                </div>
              ) : null}

              {wide ? (
                <>
                  <div className="relative z-1 max-w-[min(100%,26em)]">
                    {title}
                  </div>
                  <div className="relative z-1 grid max-w-[min(100%,26em)] gap-5">
                    {details}
                  </div>
                </>
              ) : (
                <div className="relative z-1 grid gap-5">
                  {title}
                  {details}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
