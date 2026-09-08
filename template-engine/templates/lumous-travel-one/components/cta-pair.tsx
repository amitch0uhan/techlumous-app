import { ArrowUpRight } from "@phosphor-icons/react"

import { ICON_WEIGHT, join, trimmed } from "../lib"

const BUTTON_SIZE = {
  sm: "h-9 gap-1.5 px-4 text-[0.875rem]",
  md: "h-11 gap-2 px-[22px] text-base",
  lg: "h-[54px] gap-2.5 px-[30px] text-[1.0625rem]",
} as const

const BUTTON_VARIANT = {
  primary: "bg-lt-primary text-lt-on-primary lt-glow-sm hover:brightness-110",
  secondary:
    "text-lt-strong hover:border-lt-primary hover:text-lt-primary border border-lt-border/20",
  white: "bg-lt-on-image text-lt-on-light lt-shadow-button font-light",
} as const

const ICON_SIZE = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-[54px] w-[54px]",
} as const

/** Button plus trailing icon button, the pairing the design uses for every CTA. */
export function CtaPair({
  label,
  href,
  variant = "primary",
  size = "md",
  className,
}: {
  label: unknown
  href: unknown
  variant?: keyof typeof BUTTON_VARIANT
  size?: keyof typeof BUTTON_SIZE
  className?: string
}) {
  const text = trimmed(label)
  if (text.length === 0) return null
  const target = trimmed(href) || "#"
  const iconSize = size === "lg" ? 20 : 18

  return (
    <span className={join("inline-flex items-center gap-2.5", className)}>
      <a
        href={target}
        className={join(
          "ease-lt-standard tracking-lt-snug inline-flex items-center justify-center rounded-full leading-none font-semibold whitespace-nowrap transition-all duration-200",
          BUTTON_SIZE[size],
          BUTTON_VARIANT[variant]
        )}
      >
        {text}
      </a>
      <a
        href={target}
        aria-label={text}
        className={join(
          "text-lt-strong hover:border-lt-primary hover:text-lt-primary ease-lt-standard border-lt-border/20 inline-flex items-center justify-center rounded-full border transition-colors duration-200",
          ICON_SIZE[size]
        )}
      >
        <ArrowUpRight size={iconSize} weight={ICON_WEIGHT} aria-hidden="true" />
      </a>
    </span>
  )
}
