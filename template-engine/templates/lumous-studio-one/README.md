# Lumous Studio One

A draft, single-page site for a branding and web design studio, built from the
Claude Design canvas "Luma Studio" (project
`e27787fe-c35b-496b-811e-2d4295fbf196`, file `Luma Studio.dc.html`). It covers
a kinetic hero, feature image, about, process, stacked services, selected work,
who we work with, client reviews, a call-to-action band, FAQ, contact and
footer.

The canvas's `image-slot.js` and `support.js` are Claude Design editor runtime
(image drop targets and the `x-dc` component host). They have no counterpart
here: images are content fields rendered with `next/image`, and the component
logic is ordinary React.

## File layout

```text
lumous-studio-one/
  Template.tsx        # Orchestration: content, visibility, palette, fonts, motion hooks
  motion.ts           # Hero entrance + scroll-scrubbed effects (template-specific selectors)
  lib.ts              # Helpers, layout constants, loose content types, paletteStyle()
  schema.ts           # Zod contracts, inferred types, DEFAULT_COLORS, defaults
  meta.ts             # TemplateMeta
  index.ts            # Uniform module export
  styles.css          # @theme tokens, surface classes, keyframes, effects
  components/
    site-chrome.tsx   # Skip link, header over the hero, back-to-top button
    hero.tsx  feature.tsx  about.tsx  process.tsx  services.tsx  work.tsx
    audiences.tsx  testimonials.tsx  cta.tsx  faq.tsx  contact.tsx  footer.tsx
    primary-button.tsx  content-image.tsx  eyebrow.tsx  words.tsx  # Shared atoms
```

## Content contract

- Top level holds the brand (`brandName`), the booking link used by every
  "Book a call" button (`bookingLabel`, `bookingUrl`) and an `animations`
  switch.
- Each page section is one collapsible object with flat fields (`hero`,
  `about`, `process`, …), preceded by its `show*` switch. The hero has no
  switch because the header sits on it.
- Arrays of objects — approved for this template — are `aboutPillars`,
  `processSteps`, `serviceCards`, `projects`, `audienceCards`,
  `testimonialCards`, `faqItems`, `contactDetails`, `socialLinks` and
  `legalLinks`. Each is one level deep; the only nesting inside them is
  `audienceCards[].tags`, an array of plain strings.
- A project with a link is one click and hover target: its arrow link is
  stretched over the card (`after:inset-0`), so the whole card shows a pointer,
  opens the project, and lights the arrow via `group-hover/project`. The
  featured frame is 4:3 on phones and 16:8 from 700px (`.ls-work-featured`).
- The first project is featured across the full row, and the first audience
  card spans two columns on wide screens. Card colours cycle by position
  (see below), so adding or removing cards keeps the design's rhythm.
- Social icons are picked from the link's host (LinkedIn, Instagram, Dribbble,
  Behance, X, GitHub, YouTube, Facebook, TikTok, Threads; anything else gets a
  globe), so a social link is only a label and a URL.
- Contact details link when `href` is set (`mailto:`, `tel:` or a URL) and
  render as plain text otherwise.
- Testimonial quotes are rendered verbatim; the defaults include their curly
  quotation marks.
- The audience cards default to five 3D renders in the shared `techlumous`
  Storage bucket under `templates/lumous-studio-one/work_with_*.png`, so
  rendering those defaults needs network access and the bucket staying public.
  They are drawn at 50% opacity behind the card copy and come up to full
  strength on hover. Every other image default is empty; an empty image renders
  a quiet placeholder mark inside its frame, except audience card artwork,
  which is optional decoration and simply disappears.
- The call-to-action band has an image slot (`cta.imageUrl`, `cta.imageAlt`)
  in place of the canvas's decorative ring, beside the text from 1000px up and
  stacked under it below that. `cta.imagePadding` picks the treatment:
  - `none` (default) — flush: the panel drops its padding, only the text
    column is inset, and the image fills the band's side (full width under the
    text when stacked), clipped by the panel's rounded corners.
  - `padded` — an inset, rounded frame: square beside the text, 4:3 stacked.

  `cta.showImage` turns the slot off, which restores the full-width text
  layout. These four fields were added after the first version, so each
  carries a `.default()` and content saved earlier still publishes.

- Every object and array prop is read defensively (`record()`, `list()`,
  optional chaining); the renderer was tested with `{}`, `undefined`, `null`
  sections and `null` array entries.

## Colour system

`design.colors` follows the surface + component contract. `DEFAULT_COLORS` in
`schema.ts` is the only place a default hex lives, and
`defaultDesign = designSchema.parse({})`.

**Surface groups** colour free text by the panel treatment it sits on. Each is
one treatment reused wherever the design paints it:

| Group       | Editor label                         | Where                                                  |
| ----------- | ------------------------------------ | ------------------------------------------------------ |
| `page`      | Page (Hero, About, Process, Work, …) | page ground, headings, body, eyebrows, dividers        |
| `accent`    | Lime panels                          | 1st service, 2nd audience card, 3rd review, CTA band   |
| `highlight` | Lavender panels                      | 2nd service, 3rd audience card, 1st review             |
| `light`     | Cream panels                         | 3rd service, 4th audience card, Contact                |
| `card`      | Dark cards                           | 4th service, 1st & 5th audience cards, 2nd review      |
| `footer`    | Footer                               | footer ground, brand name, tagline, copyright, divider |

Card tone sequences: services `accent → highlight → light → card`, audience
cards `card → accent → highlight → light`, reviews `highlight → card → accent`.

**Component groups** — each component category paints only from its own group:

| Component                                  | Group             |
| ------------------------------------------ | ----------------- |
| CTA band + Contact "Book a call" pill      | `buttonPrimary`   |
| Header "Book a call" outline button        | `buttonOutline`   |
| CTA band "Explore our work"                | `buttonSecondary` |
| Footer "Book a call"                       | `buttonAccent`    |
| Hero headline pill + marquee dots          | `heroPill`        |
| Hero floating icons                        | `heroIcons`       |
| Process steps (number, title, text, rules) | `processStep`     |
| Service card arrow (lime/lavender/cream)   | `cardArrow`       |
| Service card arrow (dark card)             | `cardArrowOnDark` |
| Audience tags (lime/lavender/cream)        | `tag`             |
| Audience tags (dark card)                  | `tagOnDark`       |
| Project link circles                       | `workArrow`       |
| FAQ rows                                   | `accordion`       |
| Contact availability badge                 | `statusBadge`     |
| Contact email / phone links                | `contactLink`     |
| Footer social pills                        | `socialLink`      |
| Footer legal links                         | `footerLink`      |
| Back-to-top button                         | `backToTop`       |
| Skip-to-content link                       | `skipLink`        |
| Focus ring, service card shadows           | `effects`         |

How it is wired (three layers):

1. **Palette** — `paletteStyle()` in `lib.ts` writes every leaf onto the
   template root with a per-leaf fallback to `DEFAULT_COLORS`. Surface leaves
   and the `cardArrow*` / `tag*` variants become raw `--ls-<group>-<role>`
   vars; every other component leaf becomes `--color-ls-<component>-<role>`.
2. **Surface tokens** — `bg-ls-background`, `text-ls-heading`,
   `text-ls-foreground`, `text-ls-muted-foreground`, `text-ls-eyebrow`,
   `border-ls-border`. Every `.ls-surface-*` class sets all of them, filling a
   role its group lacks from the nearest one it has.
3. **Component tokens** — one `@theme` utility per role
   (`bg-ls-button-primary-background`, …).

The service card arrow and the audience tags need different colours on a dark
card than on a light one. Instead of a per-call-site switch, each
`.ls-surface-*` class maps `--color-ls-card-arrow-*` and `--color-ls-tag-*`
from the variant for that surface, so the component always reads the same
token.

Outlines, dividers and image placeholder tints use a fixed opacity at the call
site (`border-ls-border/[0.16]`, `bg-ls-border/[0.06]`): the field carries the
hue, the design carries the strength. Gradients and shadows that must follow a
token (`.ls-shadow-stack`, `.ls-glass`) are classes in `styles.css`.

## Responsiveness

The layout is fluid (`clamp()` type and spacing, `auto-fit minmax()` grids).
One custom variant, `ls-wide` (≥ 1000px), matches the design's single
breakpoint: it makes the Process and FAQ side columns sticky and switches the
audience grid to three columns.

Do not pair an `ls-wide:` utility with a base utility of the same property
(e.g. `grid-cols-1 ls-wide:grid-cols-3`). Every template imports its own
Tailwind, so another template's later copy of the base utility overrides the
variant in shared builds. The audience grid relies on the implicit single
column instead.

The root uses `overflow-x-clip` rather than `overflow-x-hidden`, because a
hidden overflow would become the scroll container and break the sticky columns
and the stacked service cards.

## Icons

Every icon comes from `@phosphor-icons/react` at one weight (`regular`, held in
`ICON_WEIGHT`). The canvas's `+` / `−` text glyphs on the FAQ are replaced by
`Plus` / `Minus` icons. Decorative icons are `aria-hidden`; interactive parents
carry the label.

## Interaction and motion

- **Entrance** (`useHeroEntrance`): brand and header button drop in, headline
  lines rise out of their masks, the pill wipes open. Runs once per mount so
  studio edits do not replay it.
- **Scroll scrubs** (`useScrollScrubs`): hero intro and section/card headings
  fade in word by word (`<Words>` renders the spans in React, never by DOM
  mutation), process steps drift through, the feature image uncrops and crops,
  service cards shrink as the next one covers them, the hero headline lifts
  away, and the back-to-top button appears after the hero.
- **Reveal**: blocks marked `data-reveal` use the shared `useScrollReveal`.
- **Ambient loops** (floating icons, pill marquee) are CSS keyframes, not GSAP,
  so they never write to the DOM and do not wake the studio preview's mutation
  observer every frame.
- `hero.fallingIcons` picks the falling set: `default` (14 design-tool icons)
  or `asterisk` (the same 14 drifts, each an asterisk). Positions, sizes and
  timing are fixed in `FLOATS` in `components/hero.tsx`; colour comes from the
  "Hero floating icons" design group. Added after the first version, so it
  carries a `.default()`.
- Process step hover dimming is pure CSS (`.ls-steps:has(> li:hover)`).
- The `animations` switch and `prefers-reduced-motion` both disable all of the
  above and leave every element in its resting state.

### Studio preview safety

The studio renders the template in an iframe sized to the full document with
no scrolling. Two rules keep that working:

- Every scrubbed animation registers a resting state. On each ScrollTrigger
  refresh, any trigger whose start is unreachable — or every trigger once the
  page cannot scroll at all — is killed and settled visible.
- Every viewport unit is capped (`clamp(560px,100svh,1100px)` for the hero,
  `min(28vh,280px)` for the stack's bottom room), because an uncapped one would
  keep growing with the auto-sized iframe.

Verified by fitting a headless viewport to the document height until it
settled (two passes): no dimmed words, hidden steps or scaled cards remained.

## Differences from the canvas

- The "Selected work" eyebrow uses the shared eyebrow colour (lavender) rather
  than lime, so every eyebrow on the page reads from one role.
- Service card arrows on lime, lavender and cream cards share one arrow colour
  (lime) instead of each echoing its own card colour.
- The 4th audience card (`#F4F2EE`) and 2nd review (`#17171B`) use the shared
  cream and dark card colours (`#EEECE6`, `#1D1D22`).
- Floating icons fade rather than also tweening their colour to grey.
- The call-to-action band's decorative lavender ring was removed and replaced
  by an editable image slot.
- The canvas's unused mobile-menu state was not ported (the design has no menu).

## Preview

With the studio running and signed in, open `/render/lumous-studio-one`.

For standalone rendering with defaults, run from the repository root in a
PowerShell session without published-content pointers:

```powershell
$env:TEMPLATE_SLUG = "lumous-studio-one"
npm --prefix template-engine run dev -- --port 3100
```

Then open `http://localhost:3100`.

## Catalog readiness

Both code registries include this slug. The template remains `draft`, the
metadata is provisional, and no database catalog row has been created. Before
release, upload a public thumbnail, set `meta.thumbnail`, and use the
established database administration process to synchronise metadata,
`defaultContent` and `defaultDesign`.
