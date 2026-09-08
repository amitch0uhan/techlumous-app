import type { LumousTravelOneContent } from "./schema"

// Content is editable, possibly older JSON: read through loose shapes + optional chaining.
export type Content = LumousTravelOneContent
export type PartialContent = Partial<Content>
export type HeroCard = Partial<Content["heroCards"][number]>
export type Destination = Partial<Content["destinations"][number]>
export type Testimonial = Partial<Content["testimonials"][number]>
export type WhyItem = Partial<Content["whyItems"][number]>
export type PackageItem = Partial<Content["packages"][number]>
export type FooterLink = Partial<Content["footerLinks"][number]>
export type Colors = Partial<Content["colors"]>

/** Pre-`colors`-group content carried three flat accent keys; still honoured. */
export type LegacyColors = {
  primaryColor?: unknown
  secondaryColor?: unknown
  onPrimaryColor?: unknown
}

export const join = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ")

export const pad = (value: number) => String(value).padStart(2, "0")

export const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value : []

export const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

/** Lays content back onto the shared column inside a full-bleed section. */
export const CONTENT = "mx-auto w-full max-w-[1440px] px-[clamp(20px,4vw,64px)]"

/** Same, applied to each direct child so the section keeps its own background. */
export const CONTENT_CHILDREN =
  "[&>*]:mx-auto [&>*]:w-full [&>*]:max-w-[1440px] [&>*]:px-[clamp(20px,4vw,64px)]"

export const SECTION_RADIUS = "rounded-[clamp(18px,2vw,28px)]"

/** One weight for every icon, matching the source canvas's hairline strokes. */
export const ICON_WEIGHT = "light" as const
