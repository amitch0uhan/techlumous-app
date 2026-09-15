import type { Carousel } from "../../../hooks/use-carousel"
import {
  CONTENT,
  join,
  list,
  pad,
  trimmed,
  type PackageItem,
  type PartialContent,
} from "../lib"
import { CarouselButton } from "./carousel-button"
import { ContentImage } from "./content-image"
import { CtaPair } from "./cta-pair"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

const WIDTH_ACTIVE = "clamp(280px, 46vw, 640px)"
const WIDTH_IDLE = "clamp(170px, 22vw, 300px)"
const GAP = "clamp(12px, 1.5vw, 20px)"

export function Packages({
  content,
  items,
  carousel,
  number,
}: {
  content: PartialContent
  items: PackageItem[]
  carousel: Carousel
  number: string
}) {
  return (
    <section
      id="packages"
      data-reveal
      className={join(CONTENT, "py-[clamp(64px,8vw,140px)]")}
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(28px,4vw,64px)]">
        <div className="flex flex-col gap-[clamp(20px,3vw,32px)]">
          <Eyebrow index={number} label={content.packagesEyebrow} />
          <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-foreground/[0.58] m-0 max-w-[26ch] leading-[1.14] font-extralight text-pretty">
            {emphasise(content.packagesHeadline)}
          </h2>
        </div>
        <div className="lt-mobile:items-start lt-mobile:justify-self-start lt-mobile:my-[clamp(10px,3vw,20px)] lt-mobile:text-left flex flex-col items-end gap-6 justify-self-end text-right">
          <p className="text-lt-sm text-lt-muted-foreground m-0 max-w-[42ch] leading-[1.75]">
            {trimmed(content.packagesNote)}
          </p>
          <CtaPair
            label={content.packagesCtaLabel}
            href={content.packagesCtaHref}
            variant="secondary"
            size="md"
          />
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-muted-foreground mt-[clamp(32px,4vw,56px)] flex items-center gap-3.5 font-extralight">
            <CarouselButton
              label="Previous package"
              direction="prev"
              onClick={carousel.prev}
              className="h-10 w-10"
            />
            <CarouselButton
              label="Next package"
              direction="next"
              onClick={carousel.next}
              variant="active"
              className="h-10 w-10"
            />
            <span>
              {pad(carousel.index + 1)} / {pad(items.length)}
            </span>
          </div>

          <div className="[margin-inline:calc(-1*clamp(20px,4vw,64px))] mt-[clamp(20px,2.5vw,32px)] overflow-hidden">
            <div
              className="ease-lt-emphasis flex items-stretch gap-[clamp(12px,1.5vw,20px)] transition-transform duration-[460ms]"
              style={{
                transform: `translateX(calc(clamp(20px, 4vw, 64px) - ${carousel.index} * (${WIDTH_IDLE} + ${GAP})))`,
              }}
            >
              {items.map((item, index) => {
                const isActive = index === carousel.index
                const title = trimmed(item?.title)
                return (
                  <article
                    key={index}
                    className="rounded-lt-lg ease-lt-emphasis relative flex min-h-[clamp(400px,46vw,520px)] flex-col justify-between overflow-hidden p-[clamp(20px,2.4vw,28px)] transition-[flex-basis] duration-[460ms]"
                    style={{
                      flex: `0 0 ${isActive ? WIDTH_ACTIVE : WIDTH_IDLE}`,
                    }}
                  >
                    <ContentImage
                      src={item?.imageUrl}
                      alt={trimmed(item?.imageAlt)}
                      fill
                      sizes="(min-width: 1024px) 45vw, 90vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="lt-scrim-card absolute inset-0"
                    />

                    {/* Whole inactive panel selects; the CTA only exists once open. */}
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => carousel.select(index)}
                        aria-label={title || `Package ${index + 1}`}
                        className="absolute inset-0 z-20 cursor-pointer bg-transparent"
                      />
                    ) : null}

                    <div
                      className={join(
                        "relative z-10 flex-wrap justify-end gap-2",
                        isActive ? "flex" : "hidden"
                      )}
                    >
                      {list<string>(item?.tags).map((tag, tagIndex) => (
                        <span
                          key={`${String(tag)}-${tagIndex}`}
                          className="font-lt-label border-lt-tag-border/[0.28] bg-lt-tag-background/[0.14] text-lt-tag-foreground flex-none rounded-full border px-3.5 py-[7px] text-[12.5px] font-extralight tracking-[0.12em] whitespace-nowrap uppercase backdrop-blur-[8px]"
                        >
                          {typeof tag === "string" ? tag : ""}
                        </span>
                      ))}
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                      <h3 className="font-lt-display tracking-lt-snug text-lt-package-card-foreground m-0 text-[clamp(20px,2vw,26px)] font-medium">
                        {title}
                      </h3>
                      <p
                        className={join(
                          "text-lt-sm text-lt-package-card-muted-foreground/80 m-0 max-w-[40ch] leading-[1.65]",
                          isActive ? "block" : "hidden"
                        )}
                      >
                        {trimmed(item?.body)}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-package-card-foreground font-extralight">
                          {trimmed(item?.price)}
                        </span>
                        {isActive ? (
                          <CtaPair
                            label={content.packagesDetailsLabel}
                            href={content.packagesCtaHref}
                            variant="primary"
                            size="sm"
                            withIcon={false}
                          />
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
