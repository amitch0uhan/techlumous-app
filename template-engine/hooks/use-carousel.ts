"use client"

import { useState } from "react"

export interface Carousel {
  /** Active index, always inside `[0, length - 1]` (`0` while the list is empty). */
  index: number
  /** Step forward one, wrapping past the end. */
  next: () => void
  /** Step back one, wrapping past the start. */
  prev: () => void
  /** Jump straight to an index. */
  select: (index: number) => void
}

/**
 * Index state for a carousel, slider, or any "one of N is active" control.
 *
 * Depends only on `length` — no DOM, no CSS, no template-specific content — so
 * it is safe to share across templates.
 *
 * `index` is clamped on every render rather than trusted from state: editable
 * collections shrink when an entry is removed in the studio, which would
 * otherwise leave the control pointing past the end of the list.
 */
export function useCarousel(length: number): Carousel {
  const [raw, setRaw] = useState(0)
  const index = length > 0 ? Math.min(raw, length - 1) : 0

  return {
    index,
    next: () => {
      if (length > 0) setRaw((index + 1) % length)
    },
    prev: () => {
      if (length > 0) setRaw((index + length - 1) % length)
    },
    select: setRaw,
  }
}
