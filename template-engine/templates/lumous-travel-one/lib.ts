import {
  DEFAULT_COLORS,
  type LumousTravelOneContent,
  type LumousTravelOneDesign,
} from "./schema"

// Content is editable, possibly older JSON: read through loose shapes + optional chaining.
export type Content = LumousTravelOneContent
export type PartialContent = Partial<Content>
export type HeroCard = Partial<Content["heroCards"][number]>
export type Destination = Partial<Content["destinations"][number]>
export type Testimonial = Partial<Content["testimonials"][number]>
export type WhyItem = Partial<Content["whyItems"][number]>
export type PackageItem = Partial<Content["packages"][number]>
export type FooterLink = Partial<Content["footerLinks"][number]>
type Palette = LumousTravelOneDesign["colors"]
export type Colors = { [Group in keyof Palette]?: Partial<Palette[Group]> }

export const join = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ")

export const pad = (value: number) => String(value).padStart(2, "0")

export const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value : []

export const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

const SURFACES = new Set(["page", "header", "section", "photo", "footer"])

const kebab = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

const paletteVar = (group: string, role: string) => {
  if (SURFACES.has(group)) return `--lt-${group}-${kebab(role)}`
  if (group === "effects") return `--color-lt-${kebab(role)}`
  return `--color-lt-${kebab(group)}-${kebab(role)}`
}

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function paletteStyle(colors: unknown) {
  const saved = record(colors)
  const style: Record<string, string> = {}
  for (const [group, roles] of Object.entries(DEFAULT_COLORS)) {
    const values = record(saved[group])
    for (const [role, fallback] of Object.entries(roles)) {
      style[paletteVar(group, role)] = trimmed(values[role]) || fallback
    }
  }
  return style
}

/** Lays content back onto the shared column inside a full-bleed section. */
export const CONTENT = "mx-auto w-full max-w-[1440px] px-[clamp(20px,4vw,64px)]"

/** Same, applied to each direct child so the section keeps its own background. */
export const CONTENT_CHILDREN =
  "[&>*]:mx-auto [&>*]:w-full [&>*]:max-w-[1440px] [&>*]:px-[clamp(20px,4vw,64px)]"

export const SECTION_RADIUS = "rounded-[clamp(18px,2vw,28px)]"

/** One weight for every icon, matching the source canvas's hairline strokes. */
export const ICON_WEIGHT = "light" as const
