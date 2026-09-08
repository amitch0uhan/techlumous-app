import { CONTENT, join, trimmed, type PartialContent } from "../lib"
import { CtaPair } from "./cta-pair"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

function Lines({ label, lines }: { label: unknown; lines: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-lt-label text-lt-subtle text-[12.5px] font-extralight tracking-[0.14em] uppercase">
        {trimmed(label)}
      </span>
      <span>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {typeof line === "string" ? line : ""}
          </span>
        ))}
      </span>
    </div>
  )
}

export function Contact({
  content,
  studioLines,
  reachLines,
  number,
}: {
  content: PartialContent
  studioLines: string[]
  reachLines: string[]
  number: string
}) {
  return (
    <section
      id="contact"
      data-reveal
      className={join(
        CONTENT,
        "flex flex-col gap-[clamp(40px,6vw,96px)] pt-[clamp(88px,11vw,180px)] pb-[clamp(10px,1vw,14px)]"
      )}
    >
      <Eyebrow index={number} label={content.contactEyebrow} />
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] items-end gap-[clamp(32px,5vw,72px)]">
        <h2 className="font-lt-display text-lt-display-lg tracking-lt-tight text-lt-strong m-0 leading-[1.1] font-extralight text-pretty">
          {emphasise(content.contactHeadline)}{" "}
          {/* Inline after the headline on desktop, its own line on mobile. */}
          <span className="lt-mobile:mt-[clamp(24px,6vw,40px)] lt-mobile:ml-0 lt-mobile:flex ml-3.5 inline-flex items-center align-middle">
            <CtaPair
              label={content.contactCtaLabel}
              href={content.contactCtaHref}
              variant="primary"
              size="lg"
            />
          </span>
        </h2>

        <div className="text-lt-sm text-lt-muted grid [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] gap-[clamp(20px,3vw,36px)] leading-[1.8]">
          <Lines label={content.contactStudioLabel} lines={studioLines} />
          <Lines label={content.contactReachLabel} lines={reachLines} />
        </div>
      </div>
    </section>
  )
}
