import { CONTENT, join, trimmed, type PartialContent } from "../lib"
import { CtaPair } from "./cta-pair"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

export function About({
  content,
  number,
}: {
  content: PartialContent
  number: string
}) {
  return (
    <section id="about" data-reveal className="py-[clamp(88px,11vw,180px)]">
      <div
        className={join(
          CONTENT,
          "grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,72px)]"
        )}
      >
        <div className="flex flex-col justify-between gap-[clamp(40px,8vw,120px)]">
          <Eyebrow index={number} label={content.aboutEyebrow} />
          <p className="font-lt-label text-lt-xs text-lt-muted m-0 max-w-[46ch] leading-[1.9] font-extralight tracking-[0.06em] uppercase">
            {trimmed(content.aboutIntro)}
          </p>
        </div>
        <div className="flex flex-col gap-[clamp(28px,3vw,44px)]">
          <h2 className="font-lt-display text-lt-display-md text-lt-body/[0.58] m-0 leading-[1.02] font-extralight tracking-[-0.04em] text-pretty">
            {emphasise(content.aboutHeadline)}
          </h2>
          <div>
            <CtaPair
              label={content.aboutCtaLabel}
              href={content.aboutCtaHref}
              variant="secondary"
              size="md"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
