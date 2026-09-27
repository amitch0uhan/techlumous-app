import { join, PANEL_RADIUS, record, WIDE, type Content } from "../lib"
import { ContentImage } from "./content-image"

export function Feature({ feature }: { feature: unknown }) {
  const f = record<Content["feature"]>(feature)
  return (
    <section
      id="feature"
      className="scroll-mt-20 px-[clamp(12px,2vw,24px)] pb-[clamp(64px,7.5vw,116px)]"
    >
      <div
        data-crop
        className={join(
          WIDE,
          PANEL_RADIUS,
          // Fixed 16:10 (the default hero.gif is 1200x750) so the image keeps its
          // shape on every device instead of following the viewport height.
          "bg-ls-border/[0.06] relative z-[1] aspect-[16/10] overflow-hidden"
        )}
      >
        <ContentImage
          src={f.imageUrl}
          alt={f.imageAlt}
          sizes="(max-width: 1400px) 100vw, 1360px"
        />
      </div>
    </section>
  )
}
