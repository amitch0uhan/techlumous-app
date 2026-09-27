import { ArrowRight, ArrowUp } from "@phosphor-icons/react"

import { external, ICON_WEIGHT } from "../lib"

/** Skip link, the header laid over the hero, and the floating back-to-top button. */
export function SiteChrome({
  brandName,
  bookingLabel,
  bookingUrl,
}: {
  brandName: string
  bookingLabel: string
  bookingUrl: string
}) {
  return (
    <>
      <a
        href="#main"
        className="bg-ls-skip-link-background text-ls-skip-link-foreground absolute top-[-60px] left-4 z-[100] rounded-full px-5 py-3 font-medium focus:top-3"
      >
        Skip to content
      </a>

      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[clamp(20px,4vw,72px)] py-[clamp(20px,3vw,44px)]">
          <a
            href="#top"
            data-hero-nav
            className="font-ls-display text-ls-heading text-[clamp(22px,2.4vw,34px)] leading-none font-semibold tracking-[-0.035em]"
          >
            {brandName}
          </a>
          {bookingLabel.length > 0 ? (
            <a
              href={bookingUrl || "#"}
              {...external(bookingUrl)}
              data-hero-nav
              className="border-ls-button-outline-border text-ls-button-outline-foreground hover:bg-ls-button-outline-hover-background hover:text-ls-button-outline-hover-foreground inline-flex min-h-[clamp(40px,3.4vw,48px)] flex-none items-center gap-2 rounded-full border-[1.5px] px-[clamp(14px,1.4vw,20px)] text-[clamp(13px,1vw,15px)] font-medium whitespace-nowrap transition-colors"
            >
              {bookingLabel}
              <ArrowRight
                size="1.2em"
                weight={ICON_WEIGHT}
                aria-hidden="true"
              />
            </a>
          ) : null}
        </div>
      </header>

      <a
        href="#top"
        aria-label="Back to top"
        data-to-top
        className="ls-glass border-ls-back-to-top-border/[0.18] text-ls-back-to-top-foreground hover:border-ls-back-to-top-hover-background hover:text-ls-back-to-top-hover-foreground fixed right-[clamp(16px,2.4vw,32px)] bottom-[clamp(16px,2.4vw,32px)] z-50 grid size-12 place-items-center rounded-full border transition-colors"
      >
        <ArrowUp size={18} weight={ICON_WEIGHT} aria-hidden="true" />
      </a>
    </>
  )
}
