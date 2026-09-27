import {
  external,
  H2,
  join,
  PANEL_RADIUS,
  record,
  trimmed,
  WIDE,
  type ContactDetail,
  type Content,
} from "../lib"
import { Eyebrow } from "./eyebrow"
import { PrimaryButton } from "./primary-button"
import { Words } from "./words"

export function Contact({
  contact,
  details,
  bookingLabel,
  bookingUrl,
}: {
  contact: unknown
  details: ContactDetail[]
  bookingLabel: string
  bookingUrl: string
}) {
  const c = record<Content["contact"]>(contact)
  const availability = trimmed(c.availability)
  return (
    <section
      id="contact"
      className="scroll-mt-20 px-[clamp(12px,2vw,24px)] pt-[clamp(64px,7.5vw,116px)] pb-[clamp(12px,2vw,24px)]"
    >
      <div
        className={join(
          WIDE,
          PANEL_RADIUS,
          "ls-surface-light bg-ls-background text-ls-heading grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-[clamp(32px,5vw,80px)] px-[clamp(24px,5vw,96px)] py-[clamp(72px,10vw,144px)]"
        )}
      >
        <div data-reveal className="grid content-start gap-6">
          <Eyebrow label={c.eyebrow} />
          <h2 data-heading-words className={H2}>
            <Words text={trimmed(c.heading)} />
          </h2>
          {availability.length > 0 ? (
            <div className="bg-ls-status-badge-background text-ls-status-badge-foreground inline-flex items-center gap-2.5 justify-self-start rounded-full px-4 py-2.5 text-[15px]">
              <span
                aria-hidden="true"
                className="bg-ls-status-badge-dot size-2.5 flex-none rounded-full"
              />
              {availability}
            </div>
          ) : null}
          <PrimaryButton href={bookingUrl} label={bookingLabel} />
        </div>

        <div data-reveal className="grid content-start">
          <dl className="border-ls-border/[0.14] m-0 grid border-t">
            {details.map((detail, index) => {
              const value = trimmed(detail?.value)
              const href = trimmed(detail?.href)
              return (
                <div
                  key={index}
                  className="border-ls-border/[0.14] grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-4 border-b py-[22px]"
                >
                  <dt className="text-ls-muted-foreground text-[15px]">
                    {trimmed(detail?.label)}
                  </dt>
                  <dd className="m-0 text-lg leading-[1.45] [overflow-wrap:anywhere]">
                    {href.length > 0 ? (
                      <a
                        href={href}
                        {...external(href)}
                        className="text-ls-contact-link-foreground hover:text-ls-contact-link-hover-foreground underline underline-offset-4 transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}
