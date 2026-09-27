import {
  COLUMN,
  H2,
  join,
  record,
  SECTION_Y,
  trimmed,
  type AboutPillar,
  type Content,
} from "../lib"
import { Eyebrow } from "./eyebrow"
import { Words } from "./words"

export function About({
  about,
  pillars,
}: {
  about: unknown
  pillars: AboutPillar[]
}) {
  const a = record<Content["about"]>(about)
  return (
    <section id="about" className={join(COLUMN, SECTION_Y, "scroll-mt-20")}>
      <div data-reveal className="mb-[clamp(56px,8vw,112px)] grid gap-6">
        <Eyebrow label={a.eyebrow} />
        <h2
          data-heading-words
          className={join(H2, "max-w-[18em] leading-[1.04]")}
        >
          <Words text={trimmed(a.heading)} />
        </h2>
      </div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(32px,4vw,64px)]">
        {pillars.map((pillar, index) => (
          <div
            key={index}
            data-reveal
            className="border-ls-border/[0.16] grid content-start gap-3 border-t pt-6"
          >
            <h3
              data-heading-words
              className="font-ls-display text-ls-heading m-0 text-2xl font-medium"
            >
              <Words text={trimmed(pillar?.title)} />
            </h3>
            <p className="text-ls-foreground m-0 text-base leading-[1.6] text-pretty">
              {trimmed(pillar?.body)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
