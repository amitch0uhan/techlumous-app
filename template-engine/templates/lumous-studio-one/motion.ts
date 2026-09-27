"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, type RefObject } from "react"

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

/**
 * Hero entrance: brand and header button drop in, the headline lines rise out
 * of their masks and the pill wipes open. Runs once per mount — re-running it
 * on every studio edit would replay the intro on each keystroke.
 */
export function useHeroEntrance<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
  enabled: boolean
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled || reducedMotion()) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(
          "[data-hero-nav]",
          { y: -20, opacity: 0, duration: 0.8, stagger: 0.1 },
          0
        )
        .from(
          "[data-line]",
          { yPercent: 115, duration: 1.1, stagger: 0.12 },
          0.15
        )
        .from(
          "[data-pill]",
          {
            clipPath: "inset(0 100% 0 0 round 999px)",
            duration: 0.9,
            ease: "power3.inOut",
          },
          0.55
        )
    }, root)

    return () => ctx.revert()
  }, [rootRef, enabled])
}

interface Settleable {
  animation: gsap.core.Animation
  /** Puts the target in its resting, fully visible state. */
  settle: () => void
}

/**
 * Scroll-scrubbed effects from the design: word-by-word heading and intro
 * fades, process steps drifting through, the feature image crop, the service
 * card stack and the hero headline parallax.
 *
 * Every scrub is registered with a resting state. On each ScrollTrigger
 * refresh, a trigger whose start can never be reached — or every trigger, when
 * the page cannot scroll at all, as in the studio's full-height preview iframe
 * — is killed and its target settled, so no content is left dimmed or hidden.
 *
 * `contentKey` re-runs the setup when content changes, because the word spans
 * and cards it animates are re-rendered from content.
 */
export function useScrollScrubs<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
  enabled: boolean,
  contentKey: unknown
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled || reducedMotion()) return

    gsap.registerPlugin(ScrollTrigger)

    let scrubs: Settleable[] = []
    const track = (animation: gsap.core.Animation, settle: () => void) => {
      scrubs.push({ animation, settle })
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)

      // Hero intro paragraph lights up word by word.
      q("[data-scrub-words]").forEach((paragraph) => {
        const words = paragraph.querySelectorAll("[data-word]")
        if (words.length === 0) return
        track(
          gsap.fromTo(
            words,
            { opacity: 0.25 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: {
                trigger: paragraph,
                start: "top 85%",
                end: "bottom 50%",
                scrub: true,
              },
            }
          ),
          () => gsap.set(words, { opacity: 1 })
        )
      })

      // Section and card headings fade in word by word.
      q("[data-heading-words]").forEach((heading) => {
        const words = heading.querySelectorAll("[data-word]")
        if (words.length === 0) return
        track(
          gsap.fromTo(
            words,
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: {
                trigger: heading,
                start: "top 92%",
                end: "top 58%",
                scrub: true,
              },
            }
          ),
          () => gsap.set(words, { opacity: 1 })
        )
      })

      // Process steps drift in, hold, then drift out as they pass.
      q("[data-step]").forEach((step) => {
        track(
          gsap
            .timeline({
              scrollTrigger: {
                trigger: step,
                start: "top 95%",
                end: "bottom 5%",
                scrub: true,
              },
            })
            .fromTo(
              step,
              { opacity: 0, y: 48 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            )
            .to(step, { opacity: 1, duration: 0.45 })
            .to(step, {
              opacity: 0,
              y: -48,
              duration: 0.25,
              ease: "power2.in",
            }),
          () => gsap.set(step, { opacity: 1, y: 0 })
        )
      })

      // Each service card shrinks slightly as the next one slides over it.
      const cards = q("[data-stack-card]")
      cards.forEach((card, index) => {
        const next = cards[index + 1]
        if (!next) return
        track(
          gsap.to(card, {
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top top",
              scrub: 0.4,
            },
          }),
          () => gsap.set(card, { scale: 1 })
        )
      })

      // Feature image uncrops while entering, then crops away while leaving.
      q("[data-crop]").forEach((crop) => {
        const wrap = crop.parentElement
        if (!wrap) return
        const share = 0.4
        const pct = share * 100
        const open = "inset(0% 0% 0% 0% round 40px)"
        const rest = () => gsap.set(crop, { y: 0, clipPath: open })
        track(
          gsap.fromTo(
            crop,
            {
              y: () => -share * crop.offsetHeight,
              clipPath: `inset(${pct}% 0% 0% 0% round 40px)`,
            },
            {
              y: 0,
              clipPath: open,
              ease: "none",
              scrollTrigger: {
                trigger: wrap,
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          ),
          rest
        )
        track(
          gsap.fromTo(
            crop,
            { y: 0, clipPath: open },
            {
              y: () => share * crop.offsetHeight,
              clipPath: `inset(0% 0% ${pct}% 0% round 40px)`,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: wrap,
                start: "top top",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          ),
          rest
        )
      })

      // Hero headline lifts and dims as the hero scrolls away.
      q("[data-hero]").forEach((hero) => {
        const headline = hero.querySelector("h1")
        if (!headline) return
        track(
          gsap.to(headline, {
            y: -60,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "center top",
              scrub: true,
            },
          }),
          () => gsap.set(headline, { y: 0, opacity: 1 })
        )
      })

      // Back-to-top button appears once the hero is mostly scrolled past.
      q("[data-to-top]").forEach((button) => {
        const hero = q("[data-hero]")[0]
        if (!hero) return
        gsap.set(button, { autoAlpha: 0 })
        track(
          gsap.to(button, {
            autoAlpha: 1,
            duration: 0.4,
            scrollTrigger: {
              trigger: hero,
              start: "bottom 70%",
              toggleActions: "play none none reverse",
            },
          }),
          () => gsap.set(button, { autoAlpha: 1 })
        )
      })
    }, root)

    const settleUnreachable = () => {
      const furthest = ScrollTrigger.maxScroll(window)
      const cannotScroll = furthest <= 1
      const stranded = scrubs.filter((entry) => {
        const trigger = entry.animation.scrollTrigger
        return cannotScroll || (trigger ? trigger.start > furthest : false)
      })
      if (stranded.length === 0) return

      scrubs = scrubs.filter((entry) => !stranded.includes(entry))
      for (const entry of stranded) {
        entry.animation.scrollTrigger?.kill()
        entry.animation.kill()
        // Recorded in the context so a later revert still restores the markup.
        ctx.add(entry.settle)
      }
    }

    ScrollTrigger.addEventListener("refresh", settleUnreachable)
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(frame)
      ScrollTrigger.removeEventListener("refresh", settleUnreachable)
      scrubs = []
      ctx.revert()
    }
  }, [rootRef, enabled, contentKey])
}
