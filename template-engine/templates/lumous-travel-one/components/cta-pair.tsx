import { ArrowUpRight } from "@phosphor-icons/react"
import Link from "next/link"
import { ICON_WEIGHT, join, trimmed } from "../lib"

const BUTTON_SIZE = {
  sm: "h-9 gap-1.5 px-4 text-[0.875rem]",
  md: "h-11 gap-2 px-[22px] text-base",
  lg: "h-[54px] gap-2.5 px-[30px] text-[1.0625rem]",
} as const

// Each variant paints only from its own `design.colors` button group. Hover
// styles key off the shared `group` link so both halves react together.
const BUTTON_VARIANT = {
  primary:
    "bg-lt-button-primary-background text-lt-button-primary-foreground lt-glow-sm group-hover:bg-lt-button-primary-hover-background",
  secondary:
    "text-lt-button-secondary-foreground border border-lt-button-secondary-border/20 group-hover:border-lt-button-secondary-hover-border group-hover:text-lt-button-secondary-hover-foreground",
  header:
    "bg-lt-button-header-background text-lt-button-header-foreground lt-shadow-button font-light group-hover:bg-lt-button-header-hover-background",
} as const

const ICON_SIZE = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-[54px] w-[54px]",
} as const

/**
 * Button plus trailing icon button, the pairing the design uses for every CTA.
 * Both halves are one link so they read, click and hover as a single button.
 * On `lt-mobile` only one half remains: the rounded label by default, or the
 * icon button when `mobile="icon"`. `withIcon={false}` renders the label alone.
 */
export function CtaPair({
  label,
  href,
  variant = "primary",
  size = "md",
  mobile = "label",
  withIcon = true,
  className,
}: {
  label: unknown
  href: unknown
  variant?: keyof typeof BUTTON_VARIANT
  size?: keyof typeof BUTTON_SIZE
  mobile?: "label" | "icon"
  withIcon?: boolean
  className?: string
}) {
  const text = trimmed(label)
  if (text.length === 0) return null
  const target = trimmed(href) || "#"
  const iconSize = size === "lg" ? 20 : 18
  const iconOnMobile = withIcon && mobile === "icon"

  return (
    <Link
      href={target}
      aria-label={text}
      className={join(
        "group inline-flex items-center gap-0.5 rounded-full",
        className
      )}
    >
      <span
        className={join(
          "ease-lt-standard tracking-lt-snug inline-flex items-center justify-center rounded-full leading-none font-semibold whitespace-nowrap transition-all duration-200",
          BUTTON_SIZE[size],
          BUTTON_VARIANT[variant],
          iconOnMobile ? "lt-mobile:hidden" : undefined
        )}
      >
        {text}
      </span>
      {withIcon ? (
        <span
          aria-hidden="true"
          className={join(
            "text-lt-button-secondary-foreground border-lt-button-secondary-border/20 group-hover:border-lt-button-secondary-hover-border group-hover:text-lt-button-secondary-hover-foreground ease-lt-standard inline-flex items-center justify-center rounded-full border transition-colors duration-200",
            ICON_SIZE[size],
            iconOnMobile ? undefined : "lt-mobile:hidden"
          )}
        >
          <ArrowUpRight
            size={iconSize}
            weight={ICON_WEIGHT}
            className="ease-lt-standard transition-transform duration-200 group-hover:rotate-45"
          />
        </span>
      ) : null}
    </Link>
  )
}
