import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"

import { ICON_WEIGHT, join } from "../lib"

// `default` / `active` paint from the `arrowButton` group, `photo` from
// `heroArrow`; the call site only chooses the size.
const VARIANT = {
  default:
    "text-lt-arrow-button-foreground border-lt-arrow-button-border/20 border bg-transparent",
  active:
    "bg-lt-arrow-button-active-background text-lt-arrow-button-active-foreground border-lt-arrow-button-border/20 border",
  photo:
    "border-lt-hero-arrow-border/30 bg-lt-hero-arrow-background/10 text-lt-hero-arrow-foreground border",
} as const

export function CarouselButton({
  label,
  direction,
  onClick,
  variant = "default",
  className,
}: {
  label: string
  direction: "prev" | "next"
  onClick: () => void
  variant?: keyof typeof VARIANT
  className: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={join(
        "ease-lt-standard grid cursor-pointer place-items-center rounded-full transition-colors duration-200",
        VARIANT[variant],
        className
      )}
    >
      {direction === "prev" ? (
        <ArrowLeft size={17} weight={ICON_WEIGHT} aria-hidden="true" />
      ) : (
        <ArrowRight size={17} weight={ICON_WEIGHT} aria-hidden="true" />
      )}
    </button>
  )
}
