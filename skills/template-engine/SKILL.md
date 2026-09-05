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
export interface TemplateModule<TContent> {
  meta: TemplateMeta
  contentSchema: ZodType<TContent>
  defaultContent: TContent
  Template: (props: { content: TContent }) => ReactElement
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
- The `Template` component must render solely from its `content` prop. Do not
  fetch project data or read studio state from inside a template.
- `index.ts` must export a value named exactly `template`. The file-upload
  deployment generates a single-template registry that depends on this name.
- A template may import files inside its own folder and engine-owned shared
  runtime files. It must not import another template or unrelated root-app code;
  those files are absent from a single-template deployment.
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

## Choose the Smallest Change

- Visual-only change: edit `Template.tsx` and template-local styles/assets.
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
- Make the template responsive and usable at the studio preview widths as well
  as on the standalone published page.

## Content Schema Rules

The studio generates its edit form from Zod `.meta()` values. Supported editor
metadata is:

```ts
.meta({
  label: "Field label",
  widget: "text" | "textarea" | "url" | "image" | "select",
  format: "url",
  labelLayout: "above" | "beside",
})
```

Use these editor-safe shapes:

- `z.string()` for text; select `textarea`, `url`, or `image` with metadata.
- `z.enum([...])` for a select.
- `z.object({...})` for a group.
- `z.array(...)` for an add/remove list.
- Optional, nullable, default, prefault, and readonly wrappers only after
  checking how an empty value should be created by the form.

Keep new content props as flat as practical. Prefer top-level scalar props and
arrays of primitive values; do not introduce nested objects or arrays of objects
just for grouping. If the requested design genuinely requires either shape,
flag the proposed schema to the user and get confirmation before implementing
it. Existing nested schemas are legacy contracts and must not be flattened
silently because that would break stored content.

Do not assume arbitrary Zod constructs have a matching editor. Numbers and
booleans are recognized structurally but currently fall back to a text input,
which can produce strings. Unions, tuples, records, dates, transforms, and
custom effects are not normalized as dedicated controls. Extend and test the
schema-form system first if one is required.

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
