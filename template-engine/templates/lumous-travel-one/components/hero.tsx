import type { ReactNode } from "react"

import type { Carousel } from "../../../hooks/use-carousel"
import {
  CONTENT,
  join,
  pad,
  SECTION_RADIUS,
  trimmed,
  type HeroCard,
  type PartialContent,
} from "../lib"
import { CarouselButton } from "./carousel-button"
import { ContentImage } from "./content-image"
import { emphasise } from "./emphasise"

export function Hero({
  content,
  cards,
  tags,
  carousel,
  navBar,
}: {
  content: PartialContent
  cards: HeroCard[]
  tags: string[]
  carousel: Carousel
  navBar: ReactNode
}) {
  return (
    <section
      id="top"
      className={join(
        SECTION_RADIUS,
        "lt-surface-photo relative flex min-h-[clamp(600px,92vh,900px)] flex-col justify-between overflow-hidden py-[clamp(16px,2.2vw,28px)]"
      )}
    >
      <ContentImage
        src={content.heroImageUrl}
        alt={trimmed(content.heroImageAlt)}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="lt-scrim-hero absolute inset-0" />

      <div className={join(CONTENT, "relative z-10")}>{navBar}</div>

      <div
        className={join(
          CONTENT,
          "relative z-10 mt-[clamp(48px,8vw,120px)] flex flex-col gap-[clamp(28px,4vw,56px)]"
        )}
      >
        <h1 className="font-lt-display text-lt-display-lg tracking-lt-tight text-lt-heading m-0 max-w-[20ch] leading-[1.06] font-extralight text-balance">
          {emphasise(content.heroHeadline)}
        </h1>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(20px,3vw,40px)]">
          {tags.length > 0 ? (
            <div className="flex max-w-[460px] flex-wrap gap-2.5">
              {tags.map((tag, index) => (
                <span
                  key={`${String(tag)}-${index}`}
                  className="text-lt-sm border-lt-tag-border/[0.14] bg-lt-tag-background/[0.03] text-lt-tag-foreground rounded-full border px-[18px] py-[9px] backdrop-blur-[16px] backdrop-saturate-[1.2]"
                >
                  {typeof tag === "string" ? tag : ""}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          {cards.length > 0 ? (
            <div className="flex min-w-0 flex-col gap-4">
              <div className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-hero-progress-label/70 flex items-center gap-3.5 font-extralight">
                <span>{pad(carousel.index + 1)}</span>
                <span className="bg-lt-hero-progress-track/[0.28] relative h-px flex-1 overflow-hidden">
                  <span
                    className="ease-lt-standard bg-lt-hero-progress-fill absolute inset-y-0 left-0 transition-[width] duration-200"
                    style={{
                      width: `${((carousel.index + 1) / cards.length) * 100}%`,
                    }}
                  />
                </span>
                <span>{pad(cards.length)}</span>
                <CarouselButton
                  label="Previous trip"
                  direction="prev"
                  onClick={carousel.prev}
                  variant="photo"
                  className="h-[30px] w-[30px]"
                />
                <CarouselButton
                  label="Next trip"
                  direction="next"
                  onClick={carousel.next}
                  variant="photo"
                  className="h-[30px] w-[30px]"
                />
              </div>

              <div className="overflow-hidden">
                <div
                  className="ease-lt-emphasis flex gap-3 transition-transform duration-[360ms]"
                  style={{
                    transform: `translateX(calc(${-carousel.index} * (clamp(240px, 78%, 320px) + 12px)))`,
                  }}
                >
                  {cards.map((card, index) => (
                    <article
                      key={index}
                      className="lt-shadow-float border-lt-trip-card-border/[0.18] flex flex-[0_0_clamp(240px,78%,320px)] gap-3 rounded-[14px] border p-3 backdrop-blur-[4px] backdrop-saturate-[1.15]"
                    >
                      <ContentImage
                        src={card?.imageUrl}
                        alt={trimmed(card?.imageAlt)}
                        width={84}
                        height={78}
                        className="h-[78px] w-[84px] flex-none rounded-[9px] object-cover"
                      />
                      <div className="flex min-w-0 flex-col justify-between gap-2.5">
                        <p className="font-lt-display text-lt-trip-card-foreground m-0 text-base font-light">
                          {trimmed(card?.title)}
                        </p>
                        <p className="font-lt-label text-lt-trip-card-muted-foreground/70 m-0 text-[10.5px] font-extralight tracking-[0.12em] uppercase">
                          {trimmed(card?.meta)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
