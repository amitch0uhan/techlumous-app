import { ArrowUpRight } from "@phosphor-icons/react"
import type { CSSProperties } from "react"

import {
  external,
  H2,
  ICON_WEIGHT,
  join,
  pad,
  record,
  SECTION_Y,
  toneAt,
  trimmed,
  WIDE,
  type Content,
  type ServiceCard,
  type Tone,
} from "../lib"
import { ContentImage } from "./content-image"
import { Eyebrow } from "./eyebrow"
import { Words } from "./words"

/** Card treatments in design order; longer lists repeat the cycle. */
const TONES: readonly Tone[] = ["accent", "highlight", "light", "card"]

export function Services({
  services,
  cards,
  bookingLabel,
  bookingUrl,
}: {
  services: unknown
  cards: ServiceCard[]
  bookingLabel: string
  bookingUrl: string
}) {
  const s = record<Content["services"]>(services)
  return (
    <section
      id="services"
      className={join(
        WIDE,
        SECTION_Y,
        "scroll-mt-20 px-[clamp(12px,2vw,24px)]"
      )}
    >
      <div
        data-reveal
        className="mb-[clamp(48px,7vw,104px)] grid gap-5 px-[clamp(8px,2vw,24px)]"
      >
        <Eyebrow label={s.eyebrow} />
        <h2 data-heading-words className={join(H2, "max-w-[14em]")}>
          <Words text={trimmed(s.heading)} />
        </h2>
      </div>

      {/* Bottom room lets the last sticky card settle; capped for the preview. */}
      <div className="grid gap-[clamp(20px,2.2vw,32px)] pb-[min(28vh,280px)]">
        {cards.map((card, index) => {
          const title = trimmed(card?.title)
          return (
            <article
              key={index}
              data-stack-card
              style={{ "--ls-stack": index } as CSSProperties}
              className={join(
                `ls-surface-${toneAt(TONES, index)}`,
                // One click/hover target: the arrow link is stretched over the
                // card (sticky is positioned, so it anchors the overlay).
                "group/service",
                bookingLabel.length > 0 && "cursor-pointer",
                "ls-shadow-stack bg-ls-background text-ls-heading border-ls-border/[0.08] sticky top-[calc(clamp(20px,4vh,44px)+var(--ls-stack)*22px)] grid origin-top content-between gap-[clamp(28px,3vw,44px)] rounded-[clamp(28px,3vw,40px)] border p-[clamp(28px,3.6vw,56px)] will-change-transform"
              )}
            >
              <div className="grid gap-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-ls-mono text-[13px]">
                    {pad(index + 1)}
                  </span>
                  {bookingLabel.length > 0 ? (
                    <a
                      href={bookingUrl || "#"}
                      {...external(bookingUrl)}
                      aria-label={`${bookingLabel}: ${title}`}
                      className="bg-ls-card-arrow-background text-ls-card-arrow-foreground group-hover/service:bg-ls-card-arrow-hover-background group-focus-within/service:bg-ls-card-arrow-hover-background grid size-[52px] flex-none place-items-center rounded-full transition-colors after:absolute after:inset-0 after:z-[2] after:content-['']"
                    >
                      <ArrowUpRight
                        size={20}
                        weight={ICON_WEIGHT}
                        aria-hidden="true"
                      />
                    </a>
                  ) : null}
                </div>
                <h3
                  data-heading-words
                  className="font-ls-display text-ls-heading m-0 text-[clamp(32px,3.4vw,52px)] leading-none font-medium tracking-[-0.03em]"
                >
                  <Words text={title} />
                </h3>
                <p className="text-ls-foreground m-0 max-w-[30em] text-[17px] leading-[1.65] text-pretty">
                  {trimmed(card?.body)}
                </p>
              </div>
              <div className="bg-ls-border/[0.08] relative h-[clamp(180px,24vw,320px)] overflow-hidden rounded-3xl">
                <ContentImage
                  src={card?.imageUrl}
                  alt={card?.imageAlt}
                  sizes="(max-width: 1400px) 92vw, 1250px"
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
