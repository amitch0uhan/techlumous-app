import type { Carousel } from "../../../hooks/use-carousel"
import {
  CONTENT_CHILDREN,
  join,
  SECTION_RADIUS,
  trimmed,
  type Destination,
  type PartialContent,
} from "../lib"
import { CarouselButton } from "./carousel-button"
import { ContentImage } from "./content-image"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

const REGION_ROW = "clamp(34px, 3.4vw, 46px)"
// Defined by `.lt-destination-carousel` in styles.css, incl. its mobile override.
const SLIDE = "var(--lt-slide)"

export function Destinations({
  content,
  items,
  carousel,
  number,
}: {
  content: PartialContent
  items: Destination[]
  carousel: Carousel
  number: string
}) {
  const active = items[carousel.index]

  return (
    <section
      id="destinations"
      data-reveal
      className={join(
        SECTION_RADIUS,
        CONTENT_CHILDREN,
        "lt-surface-section bg-lt-background py-[clamp(64px,8vw,140px)]"
      )}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
        <div className="flex flex-col gap-[clamp(20px,3vw,36px)]">
          <Eyebrow index={number} label={content.destinationsEyebrow} />
          <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-heading m-0 max-w-[24ch] leading-[1.14] font-extralight text-pretty">
            {emphasise(content.destinationsHeadline)}
          </h2>
        </div>

        {items.length > 0 ? (
          // Vertical region picker; hidden on mobile, arrows replace it. The
          // active region sits in the bottom slot with upcoming ones stacked
          // above, so advancing slides the list down toward the image.
          <div
            className="lt-mobile:hidden flex w-full flex-col justify-end justify-self-end overflow-hidden mask-[linear-gradient(to_top,transparent_0%,#000_16%,#000_68%,transparent_100%)]"
            style={{
              height: `calc(4 * (${REGION_ROW} + 10px))`,
              paddingBottom: `calc(${REGION_ROW} * 0.5)`,
            }}
          >
            <div
              className="ease-lt-emphasis flex shrink-0 flex-col-reverse items-end gap-2.5 text-right transition-transform duration-480"
              style={{
                transform: `translateY(calc(${carousel.index} * (${REGION_ROW} + 10px)))`,
              }}
            >
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => carousel.select(index)}
                  aria-current={index === carousel.index}
                  className={join(
                    "font-lt-display tracking-lt-snug ease-lt-standard flex cursor-pointer items-center border-none bg-transparent p-0 text-right text-[clamp(20px,2vw,28px)] transition-opacity duration-300",
                    index === carousel.index
                      ? "text-lt-region-picker-active-foreground"
                      : "text-lt-region-picker-inactive-foreground"
                  )}
                  style={{
                    flex: `0 0 ${REGION_ROW}`,
                    height: REGION_ROW,
                    opacity:
                      index === carousel.index
                        ? 1
                        : Math.max(
                            0.16,
                            0.62 - Math.abs(index - carousel.index) * 0.16
                          ),
                  }}
                >
                  {trimmed(item?.region)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mt-[clamp(56px,7vw,104px)] flex flex-wrap items-end gap-[clamp(24px,3vw,40px)]">
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4.5 pb-[clamp(8px,2vw,40px)]">
            <p className="font-lt-display text-lt-heading m-0 text-[clamp(18px,1.6vw,22px)] font-medium">
              {trimmed(active?.title)}
            </p>
            <p className="text-lt-sm text-lt-muted-foreground m-0 max-w-[34ch] leading-[1.7]">
              {trimmed(active?.body)}
            </p>
          </div>

          {/* Full width on mobile (one whole slide) vs. the 1.5-slide desktop peek. */}
          <div className="lt-destination-carousel lt-mobile:ml-0 lt-mobile:flex-[0_0_100%] ml-auto flex-[0_0_min(68vw,940px,100%)] overflow-hidden">
            <div
              className="ease-lt-emphasis flex items-start gap-[clamp(12px,1.5vw,20px)] transition-transform duration-420"
              style={{
                transform: `translateX(calc(${-carousel.index} * (${SLIDE} + clamp(12px, 1.5vw, 20px))))`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-4/3 overflow-hidden rounded-xl"
                  style={{ flex: `0 0 ${SLIDE}`, width: SLIDE }}
                >
                  <ContentImage
                    src={item?.imageUrl}
                    alt={trimmed(item?.imageAlt)}
                    fill
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="mt-[clamp(18px,2vw,26px)] flex items-center gap-3">
              <CarouselButton
                label="Previous destination"
                direction="prev"
                onClick={carousel.prev}
                className="h-8.5 w-8.5"
              />
              <CarouselButton
                label="Next destination"
                direction="next"
                onClick={carousel.next}
                variant="active"
                className="h-8.5 w-8.5"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
