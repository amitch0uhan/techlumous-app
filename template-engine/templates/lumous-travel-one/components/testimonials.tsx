import {
  CONTENT,
  join,
  trimmed,
  type PartialContent,
  type Testimonial,
} from "../lib"
import { ContentImage } from "./content-image"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

export function Testimonials({
  content,
  items,
  number,
}: {
  content: PartialContent
  items: Testimonial[]
  number: string
}) {
  return (
    <section
      data-reveal
      className={join(
        CONTENT,
        "flex flex-col gap-[clamp(56px,7vw,110px)] py-[clamp(88px,11vw,180px)]"
      )}
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(24px,4vw,64px)]">
        <div className="flex flex-col gap-[clamp(20px,3vw,32px)]">
          <Eyebrow index={number} label={content.testimonialsEyebrow} />
          <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-body/[0.58] m-0 max-w-[24ch] leading-[1.14] font-extralight text-pretty">
            {emphasise(content.testimonialsHeadline)}
          </h2>
        </div>
        {/* Right-aligned by the headline on desktop, left edge once stacked. */}
        <p className="text-lt-sm text-lt-muted lt-mobile:justify-self-start lt-mobile:my-[clamp(10px,3vw,20px)] lt-mobile:text-left m-0 max-w-[40ch] justify-self-end text-right leading-[1.75]">
          {trimmed(content.testimonialsNote)}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lt-lg bg-lt-card-surface lt-shadow-card border-lt-border/10 border p-[clamp(24px,2.6vw,34px)]"
            >
              <div className="flex h-full flex-col gap-[clamp(20px,3vw,32px)]">
                <p className="font-lt-display tracking-lt-snug text-lt-strong m-0 text-[clamp(16px,1.4vw,19px)] leading-[1.5] font-extralight text-pretty">
                  &ldquo;{trimmed(item?.quote)}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <ContentImage
                    src={item?.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-lt-sm text-lt-body">
                      {trimmed(item?.name)}
                    </span>
                    <span className="font-lt-label text-lt-subtle text-[12.5px] font-extralight tracking-[0.12em] uppercase">
                      {trimmed(item?.trip)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
