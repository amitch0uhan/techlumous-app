import { ImageSquare } from "@phosphor-icons/react"
import Image from "next/image"

import { ICON_WEIGHT, join, trimmed } from "../lib"

/**
 * Fills its (relatively positioned) frame with a content image. A cleared
 * image field shows a quiet placeholder mark instead, because `next/image`
 * rejects an empty `src`; pass `placeholder={false}` for optional artwork that
 * should simply disappear.
 */
export function ContentImage({
  src,
  alt,
  sizes,
  fit = "cover",
  placeholder = true,
}: {
  src: unknown
  alt: unknown
  sizes: string
  fit?: "cover" | "contain"
  placeholder?: boolean
}) {
  const url = trimmed(src)
  if (url.length === 0) {
    if (!placeholder) return null
    return (
      <div
        aria-hidden="true"
        className="text-ls-border/25 absolute inset-0 grid place-items-center"
      >
        <ImageSquare size={40} weight={ICON_WEIGHT} />
      </div>
    )
  }
  return (
    <Image
      src={url}
      alt={trimmed(alt)}
      fill
      sizes={sizes}
      className={join(fit === "contain" ? "object-contain" : "object-cover")}
    />
  )
}
