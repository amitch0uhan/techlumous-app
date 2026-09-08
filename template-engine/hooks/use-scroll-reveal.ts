"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, type RefObject } from "react"

export interface ScrollRevealOptions {
  /** Elements to reveal, matched inside the root element. */
  selector?: string
  /** Pixels the element rises through while fading in. */
  distance?: number
  duration?: number
  ease?: string
  /** ScrollTrigger `start` position. */
  start?: string
}

/**
 * Fades and lifts matching elements into view as they are scrolled to.
 *
 * Template-agnostic: the only thing tying it to a page is the `selector`, which
 * defaults to the shared `[data-reveal]` marker. Mark the elements to reveal
 * with `data-reveal` and call this once on the template root.
 *
 * The hidden start state is set from inside the effect, never in CSS, so with
 * JavaScript unavailable — or when the visitor asks for reduced motion — every
 * element renders in its resting, visible state.
 */
export function useScrollReveal<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
  options: ScrollRevealOptions = {}
): void {
  const {
    selector = "[data-reveal]",
    distance = 24,
    duration = 0.7,
    ease = "power2.out",
    start = "top 88%",
  } = options

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    gsap.registerPlugin(ScrollTrigger)

    let triggers: ScrollTrigger[] = []

    // A trigger whose start sits past the furthest reachable scroll can never
    // fire (the non-scrolling studio preview), so settle those visible instead.
    const settleUnreachable = () => {
      const furthest = ScrollTrigger.maxScroll(window)
      const stranded = triggers.filter((trigger) => trigger.start > furthest)
      if (stranded.length === 0) return

      triggers = triggers.filter((trigger) => !stranded.includes(trigger))
      for (const trigger of stranded) {
        trigger.kill()
        gsap.set(trigger.trigger as HTMLElement, { opacity: 1, y: 0 })
      }
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((element) => {
        const tween = gsap.fromTo(
          element,
          { opacity: 0, y: distance },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            scrollTrigger: { trigger: element, start, once: true },
          }
        )
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
      })

      settleUnreachable()
    }, root)

    ScrollTrigger.addEventListener("refresh", settleUnreachable)

    return () => {
      ScrollTrigger.removeEventListener("refresh", settleUnreachable)
      triggers = []
      ctx.revert()
    }
  }, [rootRef, selector, distance, duration, ease, start])
}
