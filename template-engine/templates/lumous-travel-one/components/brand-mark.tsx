import Image from "next/image"

import PlaceholderLogo from "../../../component/placeholder-logo"

/**
 * Uploaded logo in a fixed-height box that grows to `maxWidth` (object-contain,
 * never cropped); otherwise the engine's shared placeholder mark.
 */
export function BrandMark({
  logo,
  brandName,
  size,
  maxWidth,
}: {
  logo: string
  brandName: string
  size: number
  maxWidth: number
}) {
  if (logo.length === 0) {
    return <PlaceholderLogo size={size} className="block shrink-0" />
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ height: size, minWidth: size, maxWidth }}
    >
      <Image
        src={logo}
        alt={brandName || "Logo"}
        width={maxWidth}
        height={size}
        className="block h-full w-auto max-w-full object-contain"
      />
    </span>
  )
}
