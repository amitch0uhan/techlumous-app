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
    <nav className="relative z-10 flex flex-wrap items-center justify-between gap-4">
      <a href="#top" className="text-lt-on-image flex items-center gap-3">
        <BrandMark logo={logo} brandName={brandName} size={38} maxWidth={200} />
        <span className="font-lt-display tracking-lt-snug text-lt-on-image text-[clamp(15px,1.2vw,18px)] font-light">
          {brandName}
        </span>
      </a>
      {/* Dropped on mobile; the contact section carries the same action. */}
      <CtaPair
        label={ctaLabel}
        href={ctaHref}
        variant="white"
        size="md"
        className="lt-mobile:hidden"
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
        "bg-lt-nav-surface relative py-[clamp(16px,2.2vw,28px)]"
      )}
    >
      <div className={CONTENT}>{children}</div>
    </section>
  )
}
