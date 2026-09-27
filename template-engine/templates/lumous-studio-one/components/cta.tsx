import {
  external,
  join,
  PANEL_RADIUS,
  record,
  SECTION_Y,
  trimmed,
  WIDE,
  type Content,
} from "../lib"
import { ContentImage } from "./content-image"
import { PrimaryButton } from "./primary-button"
import { Words } from "./words"

/** Text padding; the panel carries it unless the image runs flush. */
const INSET = "px-[clamp(24px,6vw,112px)] py-[clamp(72px,10vw,144px)]"

export function Cta({
  cta,
  bookingLabel,
  bookingUrl,
}: {
  cta: unknown
  bookingLabel: string
  bookingUrl: string
}) {
  const c = record<Content["cta"]>(cta)
  const secondaryLabel = trimmed(c.secondaryLabel)
  const secondaryHref = trimmed(c.secondaryHref)
  // Missing = shown, so content saved before the field existed gets the slot.
  const showImage = c.showImage !== false
  // Flush (the default) unless the editor picked the padded frame.
  const flush = showImage && c.imagePadding !== "padded"

  return (
    <section
      id="book"
      className={join(SECTION_Y, "scroll-mt-20 px-[clamp(12px,2vw,24px)]")}
    >
      <div
        data-reveal
        className={join(
          WIDE,
          PANEL_RADIUS,
          "ls-surface-accent bg-ls-background text-ls-heading grid overflow-hidden",
          // Text beside the image from 1000px up; stacked below that.
          showImage && "ls-wide:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]",
          // Flush: no panel padding, so the image meets the panel edges and
          // only the text column is inset. Padded: an inset, rounded frame.
          // No image: the design's original, taller band.
          flush
            ? null
            : showImage
              ? join(INSET, "items-center gap-[clamp(40px,5vw,80px)]")
              : "items-center px-[clamp(24px,6vw,112px)] py-[clamp(88px,12vw,176px)]"
        )}
      >
        <div
          className={join(
            "grid max-w-220 content-center gap-[clamp(24px,3vw,40px)]",
            flush && INSET
          )}
        >
          <h2
            data-heading-words
            className={join(
              "font-ls-display text-ls-heading m-0 leading-[0.98] font-medium tracking-[-0.035em] text-balance",
              // The text column is narrower when it shares the row.
              showImage
                ? "text-[clamp(40px,5.4vw,88px)]"
                : "text-[clamp(40px,6.4vw,104px)]"
            )}
          >
            <Words text={trimmed(c.heading)} />
          </h2>
          <p className="text-ls-foreground m-0 max-w-[32em] text-[clamp(17px,1.4vw,20px)] leading-normal text-pretty">
            {trimmed(c.body)}
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton href={bookingUrl} label={bookingLabel} large />
            {secondaryLabel.length > 0 ? (
              <a
                href={secondaryHref || "#work"}
                {...external(secondaryHref)}
                className="border-ls-button-secondary-border/40 text-ls-button-secondary-foreground hover:bg-ls-button-secondary-hover-background/[0.08] inline-flex min-h-15 flex-none items-center rounded-full border px-7 text-[17px] whitespace-nowrap transition-colors"
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>

        {showImage ? (
          <div
            className={join(
              "relative w-full overflow-hidden",
              !c.imageUrl ? "bg-ls-border/[0.08]" : "",
              // Flush uses the panel's own corners; padded gets its own.
              flush
                ? "ls-cta-media-flush"
                : "ls-cta-media rounded-[clamp(20px,2.4vw,32px)]"
            )}
          >
            <ContentImage
              src={c.imageUrl}
              alt={c.imageAlt}
              sizes={
                flush
                  ? "(max-width: 1000px) 100vw, 600px"
                  : "(max-width: 1000px) 90vw, 520px"
              }
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
