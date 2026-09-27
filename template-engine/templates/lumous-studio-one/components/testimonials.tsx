import {
  COLUMN,
  H2,
  join,
  record,
  SECTION_Y,
  toneAt,
  trimmed,
  type Content,
  type TestimonialCard,
  type Tone,
} from "../lib"
import { Eyebrow } from "./eyebrow"
import { Words } from "./words"

/** Card treatments in design order; longer lists repeat the cycle. */
const TONES: readonly Tone[] = ["highlight", "card", "accent"]

export function Testimonials({
  testimonials,
  cards,
}: {
  testimonials: unknown
  cards: TestimonialCard[]
}) {
  const t = record<Content["testimonials"]>(testimonials)
  return (
    <section
      id="testimonials"
      className={join(COLUMN, SECTION_Y, "scroll-mt-20")}
    >
      <div
        data-reveal
        className="mb-[clamp(48px,7vw,104px)] flex flex-wrap items-end justify-between gap-6"
      >
        <div className="grid gap-5">
          <Eyebrow label={t.eyebrow} />
          <h2 data-heading-words className={H2}>
            <Words text={trimmed(t.heading)} />
          </h2>
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(20px,2.2vw,32px)]">
        {cards.map((card, index) => {
          return (
            <figure
              key={index}
              data-reveal
              className={join(
                `ls-surface-${toneAt(TONES, index)}`,
                "bg-ls-background text-ls-heading border-ls-border/[0.08] m-0 grid content-between gap-12 rounded-[32px] border p-[clamp(28px,3.6vw,56px)]"
              )}
            >
              <blockquote className="font-ls-display m-0 text-[clamp(22px,2vw,28px)] leading-[1.25] tracking-[-0.01em] text-pretty">
                {trimmed(card?.quote)}
              </blockquote>
              <figcaption className="grid gap-1">
                <span className="font-medium">{trimmed(card?.name)}</span>
                <span className="text-ls-foreground text-[15px]">
                  {trimmed(card?.role)}
                </span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
