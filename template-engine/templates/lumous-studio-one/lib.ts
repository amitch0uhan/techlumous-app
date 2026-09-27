import {
  DEFAULT_COLORS,
  type LumousStudioOneContent,
  type LumousStudioOneDesign,
} from "./schema"

// Content is editable, possibly older JSON: read through loose shapes + optional chaining.
export type Content = LumousStudioOneContent
export type PartialContent = Partial<Content>
export type Hero = Partial<Content["hero"]>
export type AboutPillar = Partial<Content["aboutPillars"][number]>
export type ProcessStep = Partial<Content["processSteps"][number]>
export type ServiceCard = Partial<Content["serviceCards"][number]>
export type Project = Partial<Content["projects"][number]>
export type AudienceCard = Partial<Content["audienceCards"][number]>
export type TestimonialCard = Partial<Content["testimonialCards"][number]>
export type FaqItem = Partial<Content["faqItems"][number]>
export type ContactDetail = Partial<Content["contactDetails"][number]>
export type FooterLink = Partial<Content["legalLinks"][number]>
type Palette = LumousStudioOneDesign["colors"]
export type Colors = { [Group in keyof Palette]?: Partial<Palette[Group]> }

export const join = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ")

export const pad = (value: number) => String(value).padStart(2, "0")

export const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value : []

export const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

export const record = <T extends object>(value: unknown): Partial<T> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<T>)
    : {}

/** External links open in a new tab; in-page anchors and mail/tel stay put. */
export const external = (href: string) =>
  /^https?:\/\//i.test(href)
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {}

/** The card treatments, as surface class suffixes. */
export type Tone = "accent" | "highlight" | "light" | "card"

/** Cycles a section's tone sequence so any number of cards keeps the rhythm. */
export const toneAt = (sequence: readonly Tone[], index: number): Tone =>
  sequence[index % sequence.length] ?? "card"

const SURFACES = new Set([
  "page",
  "accent",
  "highlight",
  "light",
  "card",
  "footer",
])

// Component groups whose light / on-dark variant is chosen by the surface the
// component sits on. They land as raw vars; `.ls-surface-*` maps them onto the
// component tokens (styles.css).
const SURFACE_SCOPED = new Set([
  "cardArrow",
  "cardArrowOnDark",
  "tag",
  "tagOnDark",
])

const kebab = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

const paletteVar = (group: string, role: string) => {
  if (SURFACES.has(group) || SURFACE_SCOPED.has(group)) {
    return `--ls-${kebab(group)}-${kebab(role)}`
  }
  if (group === "effects") return `--color-ls-${kebab(role)}`
  return `--color-ls-${kebab(group)}-${kebab(role)}`
}

export function paletteStyle(colors: unknown) {
  const saved = record<Record<string, unknown>>(colors)
  const style: Record<string, string> = {}
  for (const [group, roles] of Object.entries(DEFAULT_COLORS)) {
    const values = record<Record<string, unknown>>(saved[group])
    for (const [role, fallback] of Object.entries(roles)) {
      style[paletteVar(group, role)] = trimmed(values[role]) || fallback
    }
  }
  return style
}

/** Shared section rhythm: vertical padding for every content section. */
export const SECTION_Y = "py-[clamp(64px,7.5vw,116px)]"

/** Narrow text column used by most sections. */
export const COLUMN = "mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,48px)]"

/** Wider column for full-bleed panels (feature image, cards, CTA, contact). */
export const WIDE = "mx-auto w-full max-w-[1360px]"

export const PANEL_RADIUS = "rounded-[clamp(28px,3vw,44px)]"

/** Section headline type (About, Services, Work, Reviews, Contact). */
export const H2 =
  "font-ls-display m-0 text-[clamp(34px,4.6vw,68px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance text-ls-heading"

/** Sticky-column headline type (Process, FAQ). */
export const H2_LARGE =
  "font-ls-display m-0 text-[clamp(40px,4.4vw,84px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance text-ls-heading"

/** One weight for every icon. */
export const ICON_WEIGHT = "regular" as const
