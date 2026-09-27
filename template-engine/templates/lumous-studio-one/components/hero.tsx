import {
  Asterisk,
  BezierCurve,
  Browser,
  CompassTool,
  CursorClick,
  FrameCorners,
  Layout,
  Lightbulb,
  MagicWand,
  PaintBrush,
  Palette,
  PenNib,
  Shapes,
  Sparkle,
  TextAa,
  type Icon,
} from "@phosphor-icons/react"
import type { CSSProperties } from "react"

import { ICON_WEIGHT, trimmed, type Hero as HeroContent } from "../lib"
import { Words } from "./words"

/** Decorative icons drifting through the hero: [icon, left %, size px]. */
const FLOATS: Array<[Icon, number, number]> = [
  [PenNib, 4, 26],
  [Palette, 13, 30],
  [CursorClick, 22, 22],
  [Browser, 31, 34],
  [BezierCurve, 40, 28],
  [CompassTool, 49, 24],
  [PaintBrush, 58, 32],
  [MagicWand, 67, 22],
  [Layout, 76, 30],
  [TextAa, 85, 26],
  [FrameCorners, 94, 24],
  [Shapes, 9, 34],
  [Lightbulb, 53, 22],
  [Sparkle, 90, 28],
]

// Deterministic per-icon timing so server and client render the same markup.
const floatStyle = (index: number, left: number) => {
  const duration = 12 + ((index * 7) % 9)
  const rotate = ((index * 37) % 60) - 30
  const offset = (index * 0.618) % 1
  return {
    left: `${left}%`,
    "--ls-duration": `${duration}s`,
    "--ls-delay": `${(-offset * duration).toFixed(2)}s`,
    "--ls-rotate": `${rotate}deg`,
  } as CSSProperties
}

/** The pill repeats its word; half the strip scrolls past per loop. */
const PILL_COPIES = 6

function Pill({ word }: { word: string }) {
  return (
    <span
      data-pill
      className="bg-ls-hero-pill-background text-ls-hero-pill-foreground relative inline-flex h-[1.2em] items-center overflow-hidden rounded-full leading-[1.16]"
      style={{ width: `${Math.max(3.4, word.length * 0.5 + 0.4)}em` }}
    >
      <span className="sr-only">{word}</span>
      <span
        aria-hidden="true"
        className="ls-pill-mask flex w-full overflow-hidden"
      >
        <span className="ls-marquee inline-flex flex-none whitespace-nowrap">
          {Array.from({ length: PILL_COPIES }, (_, index) => (
            <span
              key={index}
              className="inline-flex flex-none items-center gap-[0.3em] pr-[0.3em]"
            >
              <span>{word}</span>
              <span className="bg-ls-hero-pill-foreground size-[0.16em] rounded-full" />
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}

export function Hero({ hero }: { hero: HeroContent }) {
  const start = trimmed(hero.headlineStart)
  const middle = trimmed(hero.headlineMiddle)
  const pill = trimmed(hero.pillWord)
  const end = trimmed(hero.headlineEnd)
  const intro = trimmed(hero.intro)
  // "asterisk" swaps every falling icon for an asterisk; same drift and timing.
  const asteriskOnly = hero.fallingIcons === "asterisk"

  return (
    <section
      id="top"
      data-hero
      className="relative flex flex-col px-[clamp(20px,4vw,48px)] pb-[clamp(64px,7.5vw,116px)]"
    >
      <div
        aria-hidden="true"
        className="ls-float-layer pointer-events-none absolute inset-0 overflow-hidden"
      >
        {FLOATS.map(([DesignIcon, left, size], index) => {
          const FloatIcon = asteriskOnly ? Asterisk : DesignIcon
          return (
            <span
              key={index}
              className="ls-float text-ls-hero-icons-foreground absolute top-0"
              style={floatStyle(index, left)}
            >
              <FloatIcon size={size} weight={ICON_WEIGHT} />
            </span>
          )
        })}
      </div>

      <div className="relative mx-auto grid w-full max-w-[1400px] justify-items-center text-center">
        {/* Capped: the studio preview sizes its iframe to the page, so an
            uncapped viewport unit would keep growing with it. */}
        <div className="flex min-h-[clamp(560px,100svh,1100px)] w-full items-center justify-center pt-[clamp(150px,22vh,240px)] pb-[clamp(56px,7vh,90px)]">
          <h1 className="font-ls-display text-ls-heading m-0 text-[clamp(44px,7.4vw,124px)] leading-[1.04] font-medium tracking-[-0.04em]">
            {start.length > 0 ? (
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-line className="inline-block">
                  {start}
                </span>
              </span>
            ) : null}
            {middle.length > 0 || pill.length > 0 ? (
              <span className="block overflow-hidden pt-[0.04em] pb-[0.08em]">
                <span
                  data-line
                  className="inline-flex flex-wrap items-center justify-center gap-x-[0.28em]"
                >
                  {middle.length > 0 ? <span>{middle}</span> : null}
                  {pill.length > 0 ? <Pill word={pill} /> : null}
                </span>
              </span>
            ) : null}
            {end.length > 0 ? (
              <span className="block overflow-hidden pb-[0.1em]">
                <span data-line className="inline-block">
                  {end}
                </span>
              </span>
            ) : null}
          </h1>
        </div>

        {intro.length > 0 ? (
          <p
            data-scrub-words
            className="font-ls-display text-ls-heading mx-auto mt-[clamp(24px,4vw,64px)] mb-0 max-w-[24em] text-center text-[clamp(26px,3.2vw,46px)] leading-[1.3] font-normal tracking-[-0.015em] text-pretty"
          >
            <Words text={intro} />
          </p>
        ) : null}
      </div>
    </section>
  )
}
