import Image from "next/image"
import type { ComponentProps } from "react"

import { trimmed } from "../lib"

/** A cleared image field renders nothing; `next/image` rejects an empty `src`. */
export function ContentImage({
  src,
  alt,
  ...rest
}: Omit<ComponentProps<typeof Image>, "src"> & { src: unknown }) {
  const url = trimmed(src)
  if (url.length === 0) return null
  return <Image src={url} alt={alt} {...rest} />
}
