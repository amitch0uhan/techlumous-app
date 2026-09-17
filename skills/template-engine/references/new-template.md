# Add or Change a Template

Follow every section for a new template. For an existing template, use the
applicable sections and still run the compatibility and validation checks.

## Prerequisites

Before writing code, define:

- A unique lowercase kebab-case slug matching `^[a-z0-9-]+$`.
- A category from `template-engine/templates/taxonomy.ts`.
- Name, semantic version, status, concise description, tags, and thumbnail URL.
- The complete editable content model and realistic defaults.
- Responsive layout and interaction requirements.
- Images, fonts, external hosts, browser APIs, and runtime packages the template
  needs.
- A flat content model using top-level scalar props and primitive arrays where
  possible. If nested objects or arrays of objects seem necessary, stop and
  show the proposed shape to the user before coding.
- Whether the content shape must remain compatible with existing project JSON.

Prefer tags from `SUGGESTED_TAGS`; other strings are allowed by the type. Use
`status: "draft"` until the template and its catalog entry are ready for users.

## Required Folder

```text
template-engine/templates/<slug>/
  Template.tsx       # Required renderer
  schema.ts          # Required Zod schema, inferred type, defaults
  meta.ts            # Required TemplateMeta
  index.ts           # Required uniform module export
  styles.css         # Optional template-local design system
  components/        # Optional split sections and local UI pieces
  lib.ts             # Optional local helpers, constants, loose content types
  ...                # Optional local assets
```

Engine-owned shared code a template may import:

```text
template-engine/templates/fields.ts   # Zod field builders (@/templates/fields)
template-engine/templates/types.ts    # Module contracts (@/templates/types)
template-engine/component/            # Shared runtime components (relative import)
template-engine/hooks/                # Shared runtime hooks (relative import)
```

Keep all template-specific code in this folder. Use
`template-engine/component/` and `template-engine/hooks/` only for genuinely
reusable, engine-wide runtime code.

Once a renderer grows past roughly 400 lines, split it: `Template.tsx` keeps
orchestration (reading content, visibility flags, palette, hook calls) and each
section moves to `components/<section>.tsx` receiving already-computed props.
See `lumous-travel-one` for a worked example. Name files in kebab-case and
export PascalCase components; `Template.tsx` keeps its exact capitalised name
because the module contract depends on it.

## 1. Define Metadata

Create `meta.ts`:

```ts
import type { TemplateMeta } from "@/templates/types"

export const meta: TemplateMeta = {
  slug: "my-template",
  name: "My Template",
  version: "1.0.0",
  category: "landing",
  tags: ["one-page", "minimal", "cta"],
  description: "A concise description of the intended site and audience.",
  thumbnail: "https://allowed-host.example/path/my-template.png",
  status: "draft",
}
```

The thumbnail is catalog/picker metadata, not the template's editable hero
image. Ensure its URL is reachable in every environment where the catalog is
shown.

## 2. Define the Content Contract

Create `schema.ts` with schema, inferred type, and defaults together:

```ts
import { z } from "zod"

import { area, image, link, text } from "@/templates/fields"

export const contentSchema = z.object({
  heading: text("Heading"),
  body: area("Body"),
  imageUrl: image("Image"),
  imageAlt: text("Image alt text"),
  theme: z.enum(["light", "dark"]).meta({ label: "Theme" }),
  links: z
    .array(z.object({ label: text("Label"), href: link("URL") }))
    .meta({ label: "Links" }),
})

export type MyTemplateContent = z.infer<typeof contentSchema>

export const designSchema = z.object({})
export type MyTemplateDesign = z.infer<typeof designSchema>
export const defaultDesign: MyTemplateDesign = {}

export const defaultContent: MyTemplateContent = {
  heading: "A useful default heading",
  body: "Realistic copy that exercises the intended layout.",
  imageUrl: "",
  imageAlt: "",
  theme: "light",
  links: [{ label: "Learn more", href: "https://example.com" }],
}
```

Schema design checklist:

- Keep props flat and easy to edit. The one standing exception is a single
  collapsible object per page section (`hero`, `about`, `contact`, `footer`,
  …) grouping only that section's own flat fields — this is best practice,
  not something to flag. Do not nest further inside a section object, and do
  not create any other nested object prop or array of objects for
  convenience; obtain explicit user approval for that kind of exception.
- Every editable field has a useful label.
- Prefer the shared builders in `@/templates/fields` over raw `.meta()` — they
  are the executable record of the combinations that actually work:
  `text`, `area` (long text), `link` (URL), `image`, `visibility` (section
  toggle), `color(label, fallback)`. Hand-write `.meta()` only for a shape they
  do not cover, such as `z.enum` selects and labelled groups/arrays.
- Long text uses `widget: "textarea"` — via `area()`, which also sets
  `labelLayout: "above"`. That is a real layout change, so `area()` is not a
  drop-in replacement for a textarea declared without it.
- Links use `format: "url"` (via `link()`).
- On/off state uses `z.boolean()` (renders as a switch, via `visibility()`).
  Place a `show*` section
  toggle immediately before that section's own fields so the form shows the
  switch above the content it controls.
- Colours use `widget: "color"` (swatch + hex, via `color(label, fallback)` —
  the second argument supplies the required per-leaf `.default()`). Follow the
  **Colour system rules** in the parent skill exactly:
  - one `design.colors` group of nested groups — a group per surface (`page`,
    `header`, `section`, `photo`, `footer`, …) and a group per distinct
    component category (`buttonPrimary`, `tag`, `testimonialCard`, …);
  - a group is a *type* of surface/component, reused by every instance that
    shares the same treatment — e.g. one `section` group with one colour
    input for every tinted panel on the page, not one group per section.
    Split a group into more than one only when the design itself assigns
    genuinely different colours to different instances;
  - industry key names (`background`, `foreground`, `mutedForeground`,
    `border`, `hover*`, `active*`) with plain-language labels that say where
    each colour shows; group labels list the sections affected;
  - every filled component has its matching `foreground`; include
    `effects.ring` for keyboard focus;
  - defaults live once in `DEFAULT_COLORS`; `defaultDesign =
    designSchema.parse({})`.
- Colour audit: list every component in the template README with the colour
  group it paints from. No two unrelated elements may share a group, and no
  element may use a text/border token from a different surface.
- Any new field needs a `.default()`, and any new object group needs
  `.default()` on every leaf plus `.prefault({})` on the group — nothing
  backfills a new key, so without this every existing project fails publish
  validation. See the compatibility rules in the parent skill.
- Uploaded images use `widget: "image"` (via `image()`) and have alt text.
- Groups and arrays have labels that make sense in the editor.
- Default arrays include enough realistic data to test repetition and wrapping.
- Defaults satisfy min/max and all other validations.
- The component can safely render empty strings and empty arrays where allowed.

## 3. Build the Renderer

Create `Template.tsx`:

```tsx
import type { MyTemplateContent, MyTemplateDesign } from "./schema"

import "./styles.css"

export function Template({ content }: { content: MyTemplateContent; design: MyTemplateDesign }) {
  return (
    <main>
      <h1>{content.hero.heading}</h1>
      <p>{content.hero.body}</p>
    </main>
  )
}
```

Add `"use client"` before imports only if the renderer needs client behavior.
Render all user-visible values from `content`; do not hard-code editable copy in
the component. Use stable semantic keys instead of array indexes when the
content model provides an identifier.

Box a user-supplied logo so any orientation fits. Fix one dimension, cap the
other, and use `object-contain` so a wide wordmark, a portrait mark, and a
square icon all render uncropped. Do not impose a shape, fill or border — no
circular clip that cuts the corners off a non-round logo. Keep the generated
placeholder mark on a separate branch so its look never changes. See `brandMark`
in `lumous-travel-one`.

If using Tailwind, the local `styles.css` starts with:

```css
@import "tailwindcss";

/* Placeholders only register utilities; paletteStyle() sets real values on
   the template root (a :root token cannot read a var set further down). */
@theme {
  /* surface tokens, remapped per surface */
  --color-mt-background: transparent;
  --color-mt-heading: transparent;
  --color-mt-foreground: transparent;
  --color-mt-muted-foreground: transparent;
  --color-mt-border: transparent;
  /* component tokens, one per component role */
  --color-mt-button-primary-background: transparent;
  --color-mt-button-primary-foreground: transparent;
}

/* Each surface class sets every surface token from its own palette group. */
.mt-surface-page {
  --color-mt-background: var(--mt-page-background);
  --color-mt-heading: var(--mt-page-heading);
  --color-mt-foreground: var(--mt-page-foreground);
  --color-mt-muted-foreground: var(--mt-page-muted-foreground);
  --color-mt-border: var(--mt-page-border);
}

.mt-root :where(a, button):focus-visible {
  outline: 2px solid var(--color-mt-ring);
  outline-offset: 3px;
}
```

The root element gets `mt-root mt-surface-page bg-mt-background` and
`style={paletteStyle(design?.colors)}`; each other surface wraps its area in
`mt-surface-<name> bg-mt-background`. Copy `paletteStyle()` from
`lumous-travel-one/lib.ts` (surface leaves → `--mt-<surface>-<role>`,
component leaves → `--color-mt-<component>-<role>`).

Keep custom token and keyframe names template-specific. Load template fonts in
the component and attach their variable classes at the template root.

### Scroll-triggered reveals must survive a non-scrolling viewport

Known issue in `lumous-travel-one`: sections near the end of the page (the
contact block at ~90% height) stayed invisible in the studio preview — the
content simply never appeared.

Cause: the preview renders the template in an iframe sized to the full document
height with `overflow: hidden`, so it cannot scroll. A GSAP ScrollTrigger with a
viewport-relative `start` (e.g. `"top 88%"`) never reaches its trigger point for
anything past that line, so the element is left in its hidden `from` state
(`opacity: 0`) permanently.

When a reveal effect hides content with JS, guarantee it becomes visible even
when scroll distance is zero: settle any trigger whose `start` exceeds
`ScrollTrigger.maxScroll(window)` on each refresh, or drive the reveal from an
`IntersectionObserver` instead. Never let final visibility depend on a scroll
event that a non-scrolling preview can't produce.

## 4. Export the Uniform Module

Create `index.ts`:

```ts
import type { TemplateModule } from "@/templates/types"

import { meta } from "./meta"
import { contentSchema, defaultContent, designSchema, defaultDesign, type MyTemplateContent, type MyTemplateDesign } from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<MyTemplateContent, MyTemplateDesign> = {
  meta,
  contentSchema,
  defaultContent,
  designSchema,
  defaultDesign,
  Template,
}
```

Do not rename the `template` export.

## 5. Register It Twice

Add the complete module to `template-engine/templates/registry.ts`:

```ts
import { template as myTemplate } from "./my-template"

export const templates: Record<string, AnyTemplateModule> = {
  // existing templates
  [myTemplate.meta.slug]: myTemplate,
}
```

Add the schema to `template-engine/templates/schema-registry.ts`:

```ts
import { contentSchema as myTemplateSchema } from "./my-template/schema"

const templateContentSchemas: Record<string, ZodType> = {
  // existing schemas
  "my-template": myTemplateSchema,
}
```

The first registry powers rendering. The second powers editor generation,
image-field validation, and publish validation. Missing either one leaves the
template only partially integrated.

## 6. Prepare the Catalog Projection

For a template intended to appear in the studio, prepare a database catalog row
whose fields match:

```text
meta.slug          -> slug
meta.name          -> name
meta.version       -> version
meta.category      -> category
meta.tags          -> tags
meta.description   -> description
meta.thumbnail     -> thumbnail
defaultContent     -> default_content
defaultDesign      -> default_design
```

Do not include `meta.status` unless the database schema is deliberately changed
to support it. Do not write this row from public/client code. Use the existing
database administration or migration process and preserve RLS; if no such
process is in scope, report the catalog row as a remaining operational step.

## 7. Validate End to End

Before completion:

1. Confirm `contentSchema.safeParse(defaultContent)` succeeds.
2. Run `npm run lint` and `npm run typecheck` at repository root.
3. Run `npm --prefix template-engine run build`.
4. Start the root app and confirm the catalog entry opens the correct template.
5. Exercise every generated editor field, especially arrays and images.
6. Confirm live preview updates and has no console/hydration errors.
7. Run the engine with `TEMPLATE_SLUG=<slug>` and missing Supabase pointers to
   verify defaults.
8. When deployment testing is in scope, verify the single-template package and
   configured published-content path.
9. Check mobile, tablet, and desktop layouts and keyboard-accessible behavior.
10. Change `status` and synchronize the catalog only after the template passes
    the release criteria defined by the task.

## Existing Template Schema Changes

Before changing an existing schema:

1. Compare the old and new JSON shapes.
2. Identify removed, renamed, newly required, or type-changed paths.
3. Check whether the change introduces a nested object or array of objects. If
   so, flag it to the user and wait for explicit approval.
4. Decide whether to preserve compatibility with fallbacks or migrate stored
   draft/published content.
5. Increment `meta.version` according to the project's versioning decision.
6. Update the database catalog's `default_content` and version when applicable.
7. Test both fresh defaults and representative existing content.

Never silently ship a schema change that makes existing published content
unrenderable.

## Separate content and design contract

Every module exports two inferred Zod types, two schemas and two defaults. Both
defaults must parse. Use `designSchema = z.object({})` and `defaultDesign = {}`
when there are no design controls. Travel One stores its 17-color palette in
`design.colors`; Hello World's theme remains content, and Mark One's fixed CSS
palette is unchanged. Register both schemas and design defaults in the studio
schema registry without importing renderers.

The studio uses independent Content/Design tabs with one save and publish flow.
Save both drafts atomically; validate both schemas before publishing. The iframe
applies a complete `{ content, design }` snapshot before acknowledging readiness.
The published engine selects `published_content,published_design` together and
never reads drafts. Each missing value falls back directly to its corresponding
template default. Keep editable colors exclusively in the design schema, defaults,
storage and prop. Apply `docs/template-content-design-migration.md` before rollout
and refresh the catalog cache. Source changes require a build; publishing either
dataset uses ISR.
