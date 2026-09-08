import { CONTENT, join, trimmed, type FooterLink } from "../lib"
import { BrandMark } from "./brand-mark"

export function Footer({
  brandName,
  logo,
  links,
  copyright,
}: {
  brandName: string
  logo: string
  links: FooterLink[]
  copyright: unknown
}) {
  return (
    <footer
      className={join(
        CONTENT,
        // `items-stretch` keeps the brand lockup left-aligned once stacked.
        "lt-mobile:flex-col lt-mobile:items-stretch border-lt-border/10 flex flex-wrap items-center justify-between gap-[clamp(20px,3vw,40px)] border-t pt-[clamp(24px,2.5vw,32px)] pb-[clamp(8px,0.8vw,12px)]"
      )}
    >
      <a href="#top" className="text-lt-strong flex items-center gap-3">
        <BrandMark logo={logo} brandName={brandName} size={30} maxWidth={160} />
        <span className="font-lt-display text-lt-sm tracking-lt-snug text-lt-subtle font-light">
          {brandName}
        </span>
      </a>
      <div className="font-lt-label lt-mobile:justify-center flex flex-wrap gap-[clamp(16px,2.5vw,32px)] text-xs font-extralight tracking-[0.1em] uppercase">
        {links.map((item, index) => (
          <a
            key={index}
            href={trimmed(item?.href) || "#"}
            className="text-lt-subtle hover:text-lt-primary transition-colors"
          >
            {trimmed(item?.label)}
          </a>
        ))}
      </div>
      <span className="font-lt-label text-lt-subtle lt-mobile:text-center text-xs font-extralight tracking-[0.1em]">
        {trimmed(copyright)}
      </span>
    </footer>
  )
}
