import { CONTENT, join, SECTION_RADIUS } from "../lib"
import { BrandMark } from "./brand-mark"
import { CtaPair } from "./cta-pair"

export function NavBar({
  brandName,
  logo,
  ctaLabel,
  ctaHref,
}: {
  brandName: string
  logo: string
  ctaLabel: unknown
  ctaHref: unknown
}) {
  return (
    // The header surface colours the brand name both over the hero photo and
    // on the standalone bar; the bar background itself is only NavSection's.
    <nav className="lt-surface-header relative z-10 flex flex-wrap items-center justify-between gap-4">
      <a href="#top" className="text-lt-foreground flex items-center gap-3">
        <BrandMark logo={logo} brandName={brandName} size={38} maxWidth={200} />
        <span className="font-lt-display tracking-lt-snug text-lt-foreground text-[clamp(15px,1.2vw,18px)] font-light">
          {brandName}
        </span>
      </a>
      {/* Collapses to the icon button on mobile to keep the hero bar compact. */}
      <CtaPair
        label={ctaLabel}
        href={ctaHref}
        variant="header"
        size="md"
        mobile="icon"
      />
    </nav>
  )
}

/** Standalone band that carries the nav when the hero is hidden. */
export function NavSection({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="top"
      className={join(
        SECTION_RADIUS,
        "lt-surface-header bg-lt-background relative py-[clamp(16px,2.2vw,28px)]"
      )}
    >
      <div className={CONTENT}>{children}</div>
    </section>
  )
}
