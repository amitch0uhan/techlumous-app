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
  icon.tsx           # Optional template-local component
  ...                # Optional local helpers/assets
```

Keep all template-specific code in this folder. Use
`template-engine/component/` only for genuinely reusable, engine-wide runtime
components.

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

export const contentSchema = z.object({
  hero: z
    .object({
      heading: z.string().meta({ label: "Heading" }),
      body: z
        .string()
        .meta({ label: "Body", widget: "textarea", labelLayout: "above" }),
      imageUrl: z
        .string()
        .meta({ label: "Image", widget: "image", labelLayout: "above" }),
      imageAlt: z.string().meta({ label: "Image alt text" }),
    })
    .meta({ label: "Hero" }),
  theme: z.enum(["light", "dark"]).meta({ label: "Theme" }),
  links: z
    .array(
      z.object({
        label: z.string().meta({ label: "Label" }),
        href: z.string().meta({ label: "URL", format: "url" }),
      })
    )
    .meta({ label: "Links" }),
})

export type MyTemplateContent = z.infer<typeof contentSchema>

export const defaultContent: MyTemplateContent = {
  hero: {
    heading: "A useful default heading",
    body: "Realistic copy that exercises the intended layout.",
    imageUrl: "",
    imageAlt: "",
  },
  theme: "light",
  links: [{ label: "Learn more", href: "https://example.com" }],
}
```

Schema design checklist:

- Keep props flat and easy to edit. Do not create nested object props or arrays
  of objects for convenience; obtain explicit user approval for an exception.
- Every editable field has a useful label.
- Long text uses `widget: "textarea"`.
- Links use `format: "url"`.
- Uploaded images use `widget: "image"` and have alt text.
- Groups and arrays have labels that make sense in the editor.
- Default arrays include enough realistic data to test repetition and wrapping.
- Defaults satisfy min/max and all other validations.
- The component can safely render empty strings and empty arrays where allowed.

## 3. Build the Renderer

Create `Template.tsx`:

```tsx
import type { MyTemplateContent } from "./schema"

import "./styles.css"

export function Template({ content }: { content: MyTemplateContent }) {
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

If using Tailwind, the local `styles.css` starts with:

```css
@import "tailwindcss";

@theme {
  --color-my-template-accent: #000000;
}
```

Keep custom token and keyframe names template-specific. Load template fonts in
the component and attach their variable classes at the template root.

## 4. Export the Uniform Module

Create `index.ts`:

```ts
import type { TemplateModule } from "@/templates/types"

import { meta } from "./meta"
import { contentSchema, defaultContent, type MyTemplateContent } from "./schema"
import { Template } from "./Template"

export const template: TemplateModule<MyTemplateContent> = {
  meta,
  contentSchema,
  defaultContent,
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
