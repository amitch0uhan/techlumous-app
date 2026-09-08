import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"

import { ICON_WEIGHT, join } from "../lib"

export function CarouselButton({
  label,
  direction,
  onClick,
  className,
}: {
  label: string
  direction: "prev" | "next"
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={join(
        "grid cursor-pointer place-items-center rounded-full transition-colors duration-200",
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
