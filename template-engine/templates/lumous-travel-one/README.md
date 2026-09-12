# Lumous Travel One

A draft, single-page travel-agency template built from the Claude Design canvas
"Lumous Travel One" (project `7c985e67-077f-4d2f-affa-158542d9c455`). It covers
navigation, hero, about, destinations, testimonials, why-us, packages, contact
and footer.

## File layout

```text
lumous-travel-one/
  Template.tsx        # Orchestration: content, visibility, numbering, palette
  lib.ts              # Local helpers, layout constants, loose content types
  schema.ts           # Zod contract, inferred type, defaultContent
                      # (fields built with the shared @/templates/fields)
  meta.ts             # TemplateMeta
  index.ts            # Uniform module export
  styles.css          # Local design system (@theme tokens, lt-mobile variant)
  components/
    hero.tsx  about.tsx  destinations.tsx  testimonials.tsx
    why-us.tsx  packages.tsx  contact.tsx  footer.tsx   # One per section
    nav-bar.tsx         # NavBar plus the nav-only NavSection band
    cta-pair.tsx  carousel-button.tsx  eyebrow.tsx      # Shared UI atoms
    brand-mark.tsx  content-image.tsx  emphasise.tsx
```

`Template.tsx` holds no section markup. It reads the content, derives the
visibility flags and eyebrow numbers, builds the palette, calls the shared
hooks, and passes already-computed props down. Each section component is
presentational and receives what it needs rather than reaching for state.

Carousel index state and scroll reveal come from the engine-wide hooks in
`template-engine/hooks/`, not from this folder.

## Content contract

- The schema is flat at the top level: 51 fields, all scalars except the
  `colors` group and the collections listed below.
- Section visibility is a `z.boolean()`, which the schema-form engine renders as
  a switch. Each `show*` toggle is declared immediately before the fields of the
  section it controls, so in the studio form the switch sits directly above that
  section's content. A missing value is treated as visible, so content saved
  before a control existed still renders; content saved under the earlier
  `z.enum(["show", "hide"])` still works too, since `Template.tsx` treats the
  string `"hide"` and boolean `false` the same way.
- **Every colour the template paints is editable.** The `colors` group holds 17
  six-digit hex values, one per design role, and is declared first so it renders
  at the top of the form. It is the only nested object in the schema — seventeen
  sibling `*Color` scalars would swamp the flat top level — and it is marked
  `collapsed` so the swatches do not push the rest of the panel below the fold.

  | Prop                                                     | Paints                                                                                                                   |
  | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
  | `canvas` / `navSurface` / `cardSurface` / `panelSurface` | the four opaque surfaces                                                                                                 |
  | `accentPrimary` / `accentSecondary` / `accentForeground` | buttons, glow, both tinted section panels, and the label sitting on an accent fill                                       |
  | `textStrong` / `textBody` / `textMuted` / `textSubtle`   | the warm off-panel text ramp                                                                                             |
  | `sectionText`                                            | all text inside the two tinted panels (destinations, why-us), isolated from every other role                             |
  | `onImage` / `onLight`                                    | text and controls over photography (hero, nav lockup, package cards, the white button fill); the label on a light button |
  | `border` / `scrim` / `shadow`                            | hairlines, the two image overlays, drop shadows                                                                          |

  `Template.tsx` redeclares all 17 as `--color-lt-*` custom properties on the
  template root, so every `*-lt-*` utility, every opacity modifier built on one,
  and the scrim/shadow/glow classes resolve to the studio value. The literals in
  the `@theme` block are only reached if that inline layer is absent.

  Several roles default to plain white or black because they are only ever
  painted through an opacity modifier (`border-lt-border/20`) or a `color-mix()`.
  The token carries the hue; the call site carries the strength — which is why
  the eight distinct `border-*` alphas still come from one `border` field.

  Colours that are deliberately **not** exposed: the region picker's
  `mask-image` (an alpha mask, not a visible colour — exposing it would let a
  user break the fade) and the shared `PlaceholderLogo`, which paints its own
  `#F3F3F3` as an SVG attribute that no class here can override.

  Compatibility: every leaf carries a `.default()` and the group carries
  `.prefault({})`, so content saved before the group existed still validates and
  is backfilled on publish. `Template.tsx` additionally reads the superseded flat
  `primaryColor` / `secondaryColor` / `onPrimaryColor` keys as a fallback, so an
  existing project keeps the accent it chose.

- The uploaded logo (`logoUrl`) renders inside a fixed-height box whose width
  grows with the artwork up to a cap, with `object-contain` so it is never
  cropped or squashed whatever its orientation. No shape, fill or border is
  imposed — a round logo stays round, a wordmark stays rectangular. When
  `logoUrl` is empty the engine's shared `PlaceholderLogo` is shown instead,
  unchanged — the box applies only to uploaded artwork.
- Headlines mark emphasised runs with `*asterisk pairs*`. The line renders
  dimmed and the marked words come forward, reproducing the design's two-tone
  headline without a nested content shape.
- Arrays of objects are used for `heroCards`, `destinations`, `testimonials`,
  `whyItems`, `packages` and `footerLinks`. Each is one level deep; the only
  nesting inside them is `packages[].tags`, an array of plain strings.
- The template bundles no imagery. Every photograph is content, and the
  defaults point at the shared `techlumous` Storage bucket under
  `templates/lumous-travel-one/`. Rendering the defaults therefore needs network
  access and that bucket staying public.
- A cleared image field renders no image at all, since `next/image` rejects an
  empty source and there is no bundled artwork to fall back to. The surrounding
  layout keeps its size and background, so the result is a gap rather than a
  collapsed section.

## Section order and numbering

Sections render in the order of the source design: hero, about, destinations,
testimonials, why-us, packages, contact, footer. This differs from `Agent.md`,
which lists why-us before testimonials.

The `(01)`–`(06)` eyebrow numbers are derived from the sections actually
rendered, so hiding one renumbers the rest instead of leaving a gap.

## Responsiveness

The layout is fluid rather than stepped: `clamp()` for type and spacing, and
`auto-fit minmax()` grids that collapse on their own. There is no Tailwind
`sm:`/`md:` scale in use.

Where a rule genuinely has to be mobile-only, it goes through the single
`lt-mobile` variant declared in `styles.css`, which fires below **700px** —
the width at which the section header grids stop fitting two columns. Anchoring
the variant to that point keeps the mobile rules switching in the same frame as
the layout they correct; if either the grid `minmax()` or the CONTENT padding
changes, recheck that 700px is still the collapse point.

On mobile, and only there:

- The nav's call to action collapses to its round icon button (the link keeps
  the label as its accessible name), since the full button pair cannot sit
  beside the brand lockup without wrapping. Every other call to action keeps
  only its rounded label button on mobile.
- The destinations region picker is hidden — it needs a tall masked column that
  the stacked layout has no room for — and the image carousel spans the section's
  content width, showing one whole slide instead of the desktop 1.5-slide peek.
  Its arrows remain the way to move between regions.
- The testimonials note and the packages note return to the left edge with a
  little extra space above and below, rather than staying right-aligned under a
  single-column headline.
- The contact call to action drops onto its own line below the headline.
- The footer stacks into a column, with the links and copyright centred and the
  brand lockup still left-aligned.

Slide width for the destinations carousel lives in `--lt-slide` on
`.lt-destination-carousel`, so the desktop and mobile values sit beside the
breakpoint. Neither value uses a percentage: the width feeds a `translateX()`
as well as a flex basis, and a percentage inside a transform resolves against
the slide track's own width, which would scroll the carousel by the wrong
distance.

## Icons

Every icon comes from `@phosphor-icons/react`; the template contains no inline
`<svg>` and no text glyph standing in for an icon. Three are used: `ArrowUpRight`
on the split call-to-action button, `ArrowLeft` / `ArrowRight` on the carousel
controls, and `Plus` on the why-us accordion, which rotates 45° into a close
mark when its row opens.

All of them are rendered at the `light` weight, held in the local `ICON_WEIGHT`
constant so the set stays consistent — that is the weight matching the hairline
strokes of the source canvas. Each icon inherits `currentColor` from its parent
and is marked `aria-hidden="true"`, with the accessible name carried by the
enclosing button or link.

## Interaction and motion

- Scroll reveal comes from the shared `useScrollReveal(rootRef)` hook in
  `template-engine/hooks/`, called once on the template root. Sections opt in
  with a `data-reveal` attribute. The hook sets the hidden start state from
  inside an effect, so with JavaScript unavailable every section renders in its
  resting state, and it returns early when the visitor prefers reduced motion.
- The hero trip cards, the destinations region list and image strip, and the
  packages panel carousel each use the shared `useCarousel(length)` hook plus
  CSS transitions, matching the canvas logic. The hook clamps its index on every
  render, so removing an entry in the studio cannot leave a carousel pointing
  past the end.
- Why-us is an accordion that eases open with a `0fr` to `1fr` grid row.
- An inactive package panel is one large select button and the "More details"
  call to action only appears once the panel is open, so no interactive element
  is ever nested inside another.

## Preview

With the studio running and signed in, open `/render/lumous-travel-one`.

For standalone rendering with defaults, run from the repository root in a
PowerShell session without published-content pointers:

```powershell
$env:TEMPLATE_SLUG = "lumous-travel-one"
npm --prefix template-engine run dev -- --port 3100
```

Then open `http://localhost:3100`.

## Catalog readiness

Both code registries already include this slug. The template remains `draft` and
no database catalog row is created by this implementation. Before release,
upload a public thumbnail, set `meta.thumbnail`, and use the established
database administration process to synchronize metadata and `defaultContent`.
