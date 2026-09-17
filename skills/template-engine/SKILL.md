---
name: template-engine
description: Create, modify, register, preview, validate, and troubleshoot templates in Techlumous's isolated template engine. Use when working under template-engine/, adding a template, changing a template's content schema, metadata, component, styles, assets, or dependencies, or tracing the template-specific editor, preview, catalog, publishing, and deployed-renderer boundaries. Do not use for unrelated dashboard, authentication, billing, or general deployment work.
metadata:
  short-description: Work safely on Techlumous templates
---

# Template Engine

Work on templates as self-contained products that share one typed content
contract across the studio editor, preview renderer, and published site.

## Start Here

1. Read `template-engine/README.md` and these contract files:
   - `template-engine/templates/types.ts`
   - `template-engine/templates/taxonomy.ts`
   - `template-engine/templates/registry.ts`
   - `template-engine/templates/schema-registry.ts`
2. Read the complete folder for the template being changed.
3. Read [the strict rules skill](../template-engine-strict/SKILL.md) for every
   implementation or review; its dependency allowlist and defensive content
   access rules are mandatory.
4. Read [references/architecture.md](references/architecture.md) when the task
   touches preview, publishing, Supabase content, deployment, dependencies, or
   shared app integration.
5. Read [references/new-template.md](references/new-template.md) before adding a
   template or changing a content schema.
6. Keep investigation outside these paths limited to the integration file named
   by the relevant reference. Do not pull unrelated application behavior into
   template work.

## Core Contract

Every template is a folder under `template-engine/templates/<slug>/` and must
export one uniform `template` module from `index.ts`:

```ts
export interface TemplateModule<TContent, TDesign> {
  meta: TemplateMeta
  contentSchema: ZodType<TContent>
  defaultContent: TContent
  designSchema: ZodType<TDesign>
  defaultDesign: TDesign
  Template: (props: { content: TContent; design: TDesign }) => ReactElement
}
```

Preserve these invariants:

- The folder name, `meta.slug`, registry identity, schema-registry key, database
  catalog slug, and deployment `TEMPLATE_SLUG` must be the same lowercase
  kebab-case value.
- `contentSchema` is the source of truth. Derive the content type with
  `z.infer<typeof contentSchema>` and use it for both `defaultContent` and the
  component props.
- `defaultContent` must successfully parse with `contentSchema` and must be
  complete enough to render the entire template.
- The `Template` component must render solely from its `content` and `design` props. Do not
  fetch project data or read studio state from inside a template.
- `index.ts` must export a value named exactly `template`. The file-upload
  deployment generates a single-template registry that depends on this name.
- A template may import files inside its own folder and engine-owned shared
  runtime files (`template-engine/component/`, `template-engine/hooks/`). It
  must not import another template or unrelated root-app code; those files are
  absent from a single-template deployment.
- Import engine-owned shared files by relative path (`../../hooks/use-carousel`).
  The engine aliases only `@/templates/*`, and the root app maps `@/` to the
  repository root, so an `@/hooks/...` specifier breaks one of the two builds.
- Any runtime package imported by a template must be declared in
  `template-engine/package.json` and locked by
  `template-engine/package-lock.json`.

## Scope Boundaries

The engine owns:

- Template metadata, Zod content contracts, defaults, rendering, local styles,
  template-local assets, and template runtime dependencies.
- Selecting one registered template by `TEMPLATE_SLUG`.
- Reading one project's published content and rendering it with ISR.

The engine does not own:

- Studio authentication, project authorization, billing, account state, or
  unrelated dashboard behavior.
- Draft mutation or publication orchestration.
- Database schema or RLS policy changes. Treat those as separate, explicitly
  scoped work and review their security independently.

The published engine is read-only. It uses a public Supabase anon key, and its
safety depends on RLS plus column grants allowing access only to published
content. Never place a service-role/secret key in the engine or add draft reads
or database writes to its runtime.

## Shared Runtime Hooks

`template-engine/hooks/` holds behaviour that is genuinely template-agnostic.
Reuse these before writing a local equivalent:

- `useCarousel(length)` — clamped index state for a carousel, slider, or any
  "one of N is active" control. Returns `{ index, next, prev, select }`. The
  index is clamped on every render, which is required: editable collections
  shrink when an entry is removed in the studio.
- `useScrollReveal(rootRef, options?)` — fades and lifts `[data-reveal]`
  elements into view. Mark elements with `data-reveal` and call it once on the
  template root. Pass `options.selector` to use a different marker.

Both are shipped to every deployed site, so anything added here must depend
only on its arguments — no template-specific selectors, class names, tokens, or
content shapes. A helper that needs a `lt-`-style prefix belongs in the template
folder instead.

## Choose the Smallest Change

- Visual-only change: edit `Template.tsx`, its `components/`, and
  template-local styles/assets.
- Editable-content change: update `schema.ts`, its inferred type and defaults,
  then render the new field and assess compatibility with saved/published
  content.
- Metadata change: update `meta.ts` and keep the database catalog projection in
  sync where applicable.
- New template: follow [references/new-template.md](references/new-template.md)
  completely, including both registries and catalog readiness.
- Runtime integration change: inspect only the applicable boundary in
  [references/architecture.md](references/architecture.md) before editing.

## Styling and Component Rules

- Keep the complete design system in the template folder. For Tailwind-based
  templates, use a local `styles.css` with `@import "tailwindcss"`, local
  `@theme` tokens, and prefixed/local keyframes, imported by `Template.tsx`.
- Keep `template-engine/app/globals.css` limited to engine-wide reset behavior.
- Avoid generic CSS selectors or token names that can leak across templates in
  the studio build. Prefer a template prefix for custom classes and keyframes.
- Load fonts within the template, normally with `next/font`. Do not couple a
  template to the engine layout for its fonts or theme.
- Add `"use client"` only when the template requires state, effects, browser
  APIs, or event handlers. Keep static templates as server-compatible
  components.
- Use `next/image` for optimized images. If content can reference a new remote
  host, update `template-engine/next.config.ts` deliberately and verify that the
  host restriction is no broader than required.
- Take icons from `@phosphor-icons/react`, which is already a declared engine
  dependency. Do not hand-write inline `<svg>` markup, copy path data out of a
  design file, or render a text glyph (`+`, `→`, `★`) as an icon. Phosphor is
  the same icon set the root app uses, so a template stays visually consistent
  with the studio, and its icons are tree-shaken, sized by a `size` prop, and
  inherit `currentColor` — which a pasted SVG usually does not.
  Import each icon by name so only what is used is bundled, and pick one
  `weight` (`thin` | `light` | `regular` | `bold` | `fill` | `duotone`) for the
  whole template rather than mixing weights per icon:

  ```tsx
  import { ArrowUpRight } from "@phosphor-icons/react"
  ;<ArrowUpRight size={18} weight="light" aria-hidden="true" />
  ```

  Mark a decorative icon `aria-hidden="true"` and put the label on its
  interactive parent. Phosphor components are client components, so a template
  using them needs `"use client"`.

- Make the template responsive and usable at the studio preview widths as well
  as on the standalone published page.
- Give a user-supplied brand asset (logo) a generous bounded box rather than a
  tight square. Fix one dimension, let the other grow with the artwork up to a
  cap, and use `object-contain` so a wide wordmark, a portrait mark, and a
  square icon all fit without being cropped or distorted. Do not impose a shape,
  fill or border — no `rounded-full`/`overflow-hidden` clip that would cut the
  corners off a non-round logo. Keep any generated placeholder mark on its own
  separate path so this box never changes the default look. Reference:
  `brandMark` in `lumous-travel-one`.
- Build every template's colours with the **surface + component colour
  system** below. It is mandatory: it exists because a flat list of global
  roles (`textStrong`, `border`, `onImage`, …) ended up painting unrelated
  elements on different backgrounds, so one edit changed things the user never
  meant to touch, and a dark section could not sit on a light page. Reference
  implementation: `lumous-travel-one` (`schema.ts`, `lib.ts` `paletteStyle()`,
  `styles.css`, README "Colour system").

### Colour system rules

1. **Surface groups for free text.** Give every distinct area its own group —
   typically `page`, `header`, `section` (tinted/highlighted panels), `photo`
   (text over imagery), `footer` — each with the roles it renders:
   `background`, `heading`, `foreground`, `mutedForeground`, `border`. Headlines,
   paragraphs, eyebrows and labels take their colour from the surface they sit
   on, never from a global text colour. A group is a **type** of surface or
   component, not a count of how many times it appears on the page: if three
   different sections all use the same tinted-panel treatment, they all read
   from the single `section` group with one colour input — do not create
   `sectionOne`, `sectionTwo`, or a group per section name. Split a surface or
   component into more than one group only when the design itself assigns
   genuinely different colours to different instances (e.g. About is tinted
   green while Contact is tinted blue); in that case, name each group for its
   distinct treatment, not for the section it happens to appear in first.
2. **Component colour contract.** Every distinct component category — each
   button variant, icon/arrow buttons, tags/pills/badges, each card type,
   accordions/lists, inputs, links, progress bars/counters, nav items, and any
   new component — gets **its own group** with the roles it actually paints:
   `background`, `foreground` (text/icon), `border`, plus `hover*`, `active*`,
   `muted*` for every visible state or secondary text. Two elements share a
   group only if they are the same component category with the same design
   intent; the same category styled differently in another area (hero arrows
   over a photo vs. carousel arrows on the page) gets a separate group. A
   component paints only from its own group.
3. **Naming.** Keys use industry names: `background`, `foreground`, `heading`,
   `mutedForeground`, `border`, `overlay`, `ring`, `hoverBackground`,
   `activeForeground`, … Group keys are camelCase surface/component names
   (`page`, `buttonPrimary`, `testimonialCard`). **Labels** are plain language
   and say where the colour shows: leaf labels describe the element
   ("Button text", "Keyboard focus outline"); group labels list the sections
   affected ("Page (About, Testimonials, Packages, Contact)"). The editor has no
   help-text field, so the label must carry that context.
4. **Three CSS layers.**
   - Palette: a `paletteStyle(design.colors)` helper writes every leaf onto the
     template root with a per-leaf fallback to the schema default. Surface
     leaves become raw `--<prefix>-<surface>-<role>` vars (no utilities);
     component leaves become `--color-<prefix>-<component>-<role>`.
   - Surface tokens: `--color-<prefix>-background / heading / foreground /
     muted-foreground / subtle-foreground / border`, remapped by a
     `.<prefix>-surface-<name>` class that sets **all** of them from its group
     (so nothing leaks from a parent surface).
   - Component tokens: one `@theme` token per component role.
   Register the tokens in `@theme` with `transparent` placeholders: a `:root`
   token cannot `var()` a variable declared on the template root.
5. **Forbidden.** A component using a raw palette var; a text/border token used
   outside its surface; an `onPanel`-style prop that switches colours per call
   site; a background derived from a brand colour (`color-mix` of primary into
   a panel) without its own control; inline `style={{ background }}` colours;
   duplicated hex defaults in the renderer or CSS.
6. **Single source of defaults.** Hex defaults live once, in a
   `DEFAULT_COLORS` object in `schema.ts`; `defaultDesign` is
   `designSchema.parse({})`.
7. **Always include** a filled component's matching `foreground`, and an
   `effects.ring` colour used by one shared `:focus-visible` rule.
8. **Editor layout.** Top `colors` group `collapsed: false`; every sub-group
   `collapsed: true` with `.prefault({})`; list the groups a user edits most
   (primary / outline button, page) first.
9. **Two mechanics.**
   - An **opacity modifier works on any `@theme` colour token**, so fixed alpha
     steps stay at their call sites and still follow the field:
     `border-lt-tag-border/[0.14]`. The field carries the hue; the design
     carries the strength.
   - A **Tailwind arbitrary value cannot contain a `color-mix()`**, because it
     has spaces. Any gradient or box-shadow whose colour must track a token
     becomes a class in `styles.css` (`.lt-scrim-hero`, `.lt-shadow-card`).
10. **Colour audit before completion.** For every rendered element, name the
    group it paints from and confirm it belongs to that element. Then test in
    the studio with a light page and a dark section, and change each component
    group once — only that component may change.

## Content Schema Rules

Build fields with the shared builders in `template-engine/templates/fields.ts`
rather than hand-writing `.meta()`:

```ts
import { area, color, image, link, text, visibility } from "@/templates/fields"

export const contentSchema = z.object({
  brandName: text("Brand name"),
  heroHeadline: area("Hero headline"),
  ctaHref: link("CTA destination"),
  logoUrl: image("Logo"),
  showHero: visibility("Show hero"),
})

export const DEFAULT_COLORS = {
  page: { background: "#FFFFFF", foreground: "#111111" },
  buttonPrimary: { background: "#3AAE7E", foreground: "#06120D" },
} as const

export const designSchema = z.object({
  colors: z
    .object({
      page: z
        .object({
          background: color("Page background", DEFAULT_COLORS.page.background),
          foreground: color("Body text", DEFAULT_COLORS.page.foreground),
        })
        .meta({ label: "Page (About, Contact)", collapsed: true })
        .prefault({}),
      buttonPrimary: z
        .object({
          background: color(
            "Button background",
            DEFAULT_COLORS.buttonPrimary.background
          ),
          foreground: color(
            "Button text",
            DEFAULT_COLORS.buttonPrimary.foreground
          ),
        })
        .meta({ label: "Primary button (Hero, Contact)", collapsed: true })
        .prefault({}),
    })
    .meta({ label: "Colours", collapsed: false })
    .prefault({}),
})
export const defaultDesign = designSchema.parse({})
```

That file ships with every deployment and is safe for a template to import —
unlike `schema-registry.ts` and `taxonomy.ts`, which are excluded from
single-template packaging and must never be imported by a template.

`color(label, fallback)` deliberately takes a second argument: a colour leaf
carries its own `.default()`, allowing `designSchema` to complete a partial
palette during publication validation.

Reach for raw `.meta()` only for a shape the builders do not cover. The
authoritative widget list is the `WidgetId` union in
`lib/schema-form/types.ts`:

```ts
.meta({
  label: "Field label",
  widget: "text" | "textarea" | "url" | "image" | "select" | "switch" | "color",
  format: "url",
  labelLayout: "above" | "beside",
  collapsed: true, // labelled object only: render its group closed
})
```

`labelLayout` is a real layout switch, not decoration: `"above"` renders the
label above the control instead of beside it. Two fields sharing a `widget` but
differing in `labelLayout` are not interchangeable — which is why `area()`
cannot be dropped into a schema whose textareas were declared without it.

Use these editor-safe shapes:

- `z.string()` for text; select `textarea`, `url`, or `image` with metadata.
- `z.enum([...])` for a select.
- `z.boolean()` for an on/off switch; the resolver maps it to the `switch`
  widget, and the stored value is a real boolean. Declare a `show*` toggle
  immediately before the fields of the section it controls so the generated form
  places the switch directly above that section's content.
- `z.string()` with `widget: "color"` for a swatch picker beside the hex text.
- `z.object({...})` for a group; label it to get a collapsible accordion, and add
  `collapsed: true` when it is large enough to bury the rest of the form.
- `z.array(...)` for an add/remove list.
- Optional, nullable, default, prefault, and readonly wrappers only after
  checking how an empty value should be created by the form.

The first rule of content schema design is to keep fields as flat as
practical: prefer top-level scalar props and arrays of primitive values. The
one standing exception, considered best practice rather than something that
needs case-by-case approval, is a single collapsible object per page section
— `hero`, `about`, `contact`, `footer`, and so on — grouping only that
section's own flat fields (`about: { heading, body, imageUrl }` rather than
separate top-level `aboutHeading`, `aboutBody`, `aboutImageUrl` props). Do not
nest further inside a section object. Any other nested object or array of
objects (grouping unrelated fields, an array whose items are objects, a
section object nested inside another object) still needs the proposed shape
flagged to the user with confirmation obtained before implementing it.
Existing nested schemas are legacy contracts and must not be flattened
silently because that would break stored content.

Do not assume arbitrary Zod constructs have a matching editor. Booleans resolve
to a `switch`; numbers are recognized structurally but currently fall back to a
text input, which can produce strings. Unions, tuples, records, dates,
transforms, and custom effects are not normalized as dedicated controls. Extend
and test the schema-form system first if one is required.

For an image field, set `widget: "image"`. The studio upload path validates
that metadata and requires a project id. Current accepted upload formats are
PNG, JPEG, WebP, and AVIF. Include a separate meaningful alt-text field in the
content contract when the image is rendered.

## Compatibility Rules

- Treat removing, renaming, or changing the type of a field as a breaking
  content change. Existing draft and published JSON may still use the old
  shape.
- Prefer additive fields with a deliberate fallback when compatibility is
  required. Otherwise plan an explicit content migration and version change.
- **Nothing in the pipeline backfills a newly added key.** The editor loads
  `draft_content` verbatim (a whole-document fallback, never a per-key merge),
  saving does not apply the template schema at all, and publishing `safeParse`s
  and refuses on failure. A new _required_ field therefore locks every existing
  project out of publishing until someone fills it in by hand. Give a new field
  a `.default()` so `safeParse` fills it and publish writes it back; for a new
  object group, put a `.default()` on every leaf **and** `.prefault({})` on the
  group — a plain `.default({})` short-circuits and hands back an empty object
  instead of re-parsing through the leaf defaults.
- The deployed renderer runs `<Template content={publishedContent} design={publishedDesign}>` with no
  schema parse and no error boundary above it, so a template must also read a
  new nested value defensively (`content.group ?? {}`) or an already-published
  site throws on the next deployment.
- Do not rely on the published renderer to repair invalid content. Publication
  validates against the schema, while the deployed page renders the stored
  published payload directly.
- Template source changes require a new deployment to reach an existing live
  site. Publishing content alone is picked up by ISR and does not ship new
  component code.

## Validation

Run checks in proportion to the change and report exactly what passed:

```bash
# Shared studio integration
npm run lint
npm run typecheck

# Isolated engine and deployable template build
npm --prefix template-engine run build
```

For every new or changed schema, additionally verify:

- `contentSchema.safeParse(defaultContent).success` is `true`.
- The template opens in the studio editor and every field can be edited.
- The iframe/live preview updates without console or hydration errors.
- The isolated engine renders the intended slug with local defaults.
- The layout works at mobile, tablet, and desktop preview widths.
- A production build succeeds with no imports from excluded template folders.

If the task changes only documentation, validate this skill with the
skill-creator validator instead of running application builds.

## Completion Report

State:

- Which template contract, rendering, or integration files changed.
- Whether the content shape stayed backward-compatible.
- Whether registry and catalog synchronization is complete.
- Which root and engine checks passed, and any check not run.

## Separate content and design contract

Every module exports two inferred Zod types, two schemas and two defaults. Both
defaults must parse. Use `designSchema = z.object({})` and `defaultDesign = {}`
when there are no design controls. Travel One stores its surface + component
palette in nested `design.colors` groups (see Colour system rules); Hello World's theme remains content, and Mark One's fixed CSS
palette is unchanged. Register both schemas and design defaults in the studio
schema registry without importing renderers.

The studio uses independent Content/Design tabs with one save and publish flow.
Save both drafts atomically; validate both schemas before publishing. The iframe
applies a complete `{ content, design }` snapshot before acknowledging readiness.
The published engine selects `published_content,published_design` together and
never reads drafts. Each missing value falls back directly to its corresponding
template default. Keep colors exclusively in `default_design`, `draft_design` and
`published_design`; do not copy them into content or add a compatibility resolver.
Apply `docs/template-content-design-migration.md` before rollout and refresh the
catalog cache. Source changes require a build; publishing either dataset uses ISR.
