import { ArrowUpRight } from "@phosphor-icons/react"

import { external, ICON_WEIGHT, join } from "../lib"

/** Dark pill with a round arrow badge (Call to action band, Contact). */
export function PrimaryButton({
  href,
  label,
  large = false,
}: {
  href: string
  label: string
  large?: boolean
}) {
  if (label.length === 0) return null
  return (
    <a
      href={href || "#"}
      {...external(href)}
      className={join(
        "bg-ls-button-primary-background text-ls-button-primary-foreground hover:bg-ls-button-primary-hover-background inline-flex flex-none items-center gap-3 justify-self-start rounded-full pr-2.5 font-medium whitespace-nowrap transition-colors",
        large ? "min-h-[60px] pl-7 text-[17px]" : "min-h-14 pl-[26px] text-base"
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={join(
          "bg-ls-button-primary-icon-background text-ls-button-primary-icon-foreground grid place-items-center rounded-full",
          large ? "size-[42px]" : "size-[38px]"
        )}
      >
        <ArrowUpRight size={large ? 18 : 16} weight={ICON_WEIGHT} />
      </span>
    </a>
  )
}
