import {
  BehanceLogo,
  DribbbleLogo,
  FacebookLogo,
  GithubLogo,
  Globe,
  InstagramLogo,
  LinkedinLogo,
  ThreadsLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
  type Icon,
} from "@phosphor-icons/react"

import {
  COLUMN,
  external,
  ICON_WEIGHT,
  join,
  record,
  trimmed,
  type Content,
  type FooterLink,
} from "../lib"

/** Social icon picked from the link's host, so the content stays label + URL. */
const SOCIAL_ICONS: Array<[RegExp, Icon]> = [
  [/(^|\.)linkedin\.com$/, LinkedinLogo],
  [/(^|\.)instagram\.com$/, InstagramLogo],
  [/(^|\.)dribbble\.com$/, DribbbleLogo],
  [/(^|\.)behance\.net$/, BehanceLogo],
  [/(^|\.)(x|twitter)\.com$/, XLogo],
  [/(^|\.)github\.com$/, GithubLogo],
  [/(^|\.)(youtube\.com|youtu\.be)$/, YoutubeLogo],
  [/(^|\.)facebook\.com$/, FacebookLogo],
  [/(^|\.)tiktok\.com$/, TiktokLogo],
  [/(^|\.)threads\.(net|com)$/, ThreadsLogo],
]

function socialIcon(href: string): Icon {
  let host = ""
  try {
    host = new URL(href).hostname.toLowerCase()
  } catch {
    return Globe
  }
  return SOCIAL_ICONS.find(([pattern]) => pattern.test(host))?.[1] ?? Globe
}

export function Footer({
  footer,
  brandName,
  bookingLabel,
  bookingUrl,
  socialLinks,
  legalLinks,
}: {
  footer: unknown
  brandName: string
  bookingLabel: string
  bookingUrl: string
  socialLinks: FooterLink[]
  legalLinks: FooterLink[]
}) {
  const f = record<Content["footer"]>(footer)
  const tagline = trimmed(f.tagline)
  const ctaEyebrow = trimmed(f.ctaEyebrow)

  return (
    <footer className="ls-surface-footer bg-ls-background">
      <div
        className={join(
          COLUMN,
          "grid gap-[clamp(56px,7vw,96px)] pt-[clamp(96px,12vw,160px)] pb-12"
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-12">
          <div className="grid min-w-0 flex-[1_1_480px] gap-7">
            <a
              href="#top"
              className="font-ls-display text-ls-heading justify-self-start text-[clamp(48px,7vw,112px)] leading-[0.95] font-semibold tracking-[-0.04em]"
            >
              {brandName}
            </a>
            {tagline.length > 0 ? (
              <p className="text-ls-foreground m-0 max-w-[34em] text-[clamp(16px,1.3vw,19px)] leading-[1.65] text-pretty">
                {tagline}
              </p>
            ) : null}
            {socialLinks.length > 0 ? (
              <nav aria-label="Social" className="flex flex-wrap gap-2.5">
                {socialLinks.map((social, index) => {
                  const href = trimmed(social?.href)
                  const SocialIcon = socialIcon(href)
                  return (
                    <a
                      key={index}
                      href={href || "#"}
                      {...external(href)}
                      className="border-ls-social-link-border/20 text-ls-social-link-foreground hover:border-ls-social-link-hover-background hover:bg-ls-social-link-hover-background hover:text-ls-social-link-hover-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-[18px] text-[15px] transition-colors"
                    >
                      <SocialIcon
                        size={18}
                        weight={ICON_WEIGHT}
                        aria-hidden="true"
                      />
                      {trimmed(social?.label)}
                    </a>
                  )
                })}
              </nav>
            ) : null}
          </div>

          {bookingLabel.length > 0 ? (
            <div className="grid content-start gap-4">
              {ctaEyebrow.length > 0 ? (
                <p className="text-ls-muted-foreground m-0 text-[13px] tracking-[0.04em] uppercase">
                  {ctaEyebrow}
                </p>
              ) : null}
              <a
                href={bookingUrl || "#"}
                {...external(bookingUrl)}
                className="bg-ls-button-accent-background text-ls-button-accent-foreground hover:bg-ls-button-accent-hover-background inline-flex min-h-12 flex-none items-center justify-self-start rounded-full px-[22px] text-[15px] font-medium whitespace-nowrap transition-colors"
              >
                {bookingLabel}
              </a>
            </div>
          ) : null}
        </div>

        <div className="border-ls-border/[0.12] text-ls-muted-foreground flex flex-wrap justify-between gap-4 border-t pt-6 text-sm">
          <p className="m-0">{trimmed(f.copyright)}</p>
          {legalLinks.length > 0 ? (
            <nav aria-label="Legal" className="flex flex-wrap gap-5">
              {legalLinks.map((legal, index) => {
                const href = trimmed(legal?.href)
                return (
                  <a
                    key={index}
                    href={href || "#"}
                    {...external(href)}
                    className="text-ls-footer-link-foreground hover:text-ls-footer-link-hover-foreground transition-colors"
                  >
                    {trimmed(legal?.label)}
                  </a>
                )
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
