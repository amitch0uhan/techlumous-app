# Template Engine

The template engine is an independent Next.js app that renders one selected
template as a published site. The same `templates/` source is consumed by the
studio editor, live preview, and deployed renderer.

## Structure

```text
template-engine/
  app/                         # Published-site shell and entry page
  lib/content.ts               # Published-content read boundary
  templates/
    types.ts                   # TemplateModule and TemplateMeta contracts
    taxonomy.ts                # Categories and suggested tags
    registry.ts                # Complete template modules by slug
    schema-registry.ts         # Zod schemas by slug for studio operations
    <slug>/                    # Self-contained template implementation
  package.json                 # Independent engine dependencies
  next.config.ts               # Engine build and image-host configuration
```

## Runtime and integration

- `TEMPLATE_SLUG` selects the template. `PROJECT_ID`, `SUPABASE_URL`, and
  `SUPABASE_ANON_KEY` identify the published content source.
- The runtime reads only published project content through the public Supabase
  anon key. RLS and column grants are the security boundary; never add a
  service-role key, draft read, or database write to the engine.
- If the content pointers are absent, local rendering uses `defaultContent`.
  With configured pointers, query failures throw; a missing published payload
  uses the template default. ISR revalidates published content every 60 seconds.
- The studio imports the same registry through its `@/templates/*` alias. The
  live preview sends new content to the renderer; templates only receive a
  `content` prop and do not know about editor state or the message protocol.
- Deployment uploads the engine plus only the selected template folder and a
  generated single-template registry. Do not import another template, the
  schema registry, taxonomy, or root-app-only code from a template.
- Template source changes require a new deployment. Publishing content alone
  updates the existing deployed renderer after ISR revalidation.

## Template rules

- Every template folder must export `template` from `index.ts` with `meta`,
  `contentSchema`, `defaultContent`, and `Template`.
- The folder name, `meta.slug`, both registry keys, catalog slug, and
  `TEMPLATE_SLUG` must be the same lowercase kebab-case value.
- `contentSchema` is the source of truth. `defaultContent` must parse against it
  and the renderer must be typed from `z.infer`.
- Keep styles, fonts, helpers, and assets inside the template folder. The engine
  global stylesheet is only a reset.
- Use only packages already in this folder's current `package.json`. Adding or
  installing packages is prohibited, including in AI auto-permission mode;
  only an explicit user request to install a specific package can authorize it.
- Treat content as partial or older JSON: use optional chaining and safe
  fallbacks for every nested object and array prop (`content.hero?.title ?? ""`,
  `(content.links ?? []).map(...)`). Do not directly call `.map`, `.length`,
  index, destructure, or invoke methods on possibly missing content values.
- Keep new content props flat where possible: prefer top-level scalar props and
  primitive arrays. If nested objects or arrays of objects are genuinely needed,
  flag the proposed shape to the user and get confirmation before coding.

For the full implementation rules and architecture details, read
[`skills/template-engine/SKILL.md`](../skills/template-engine/SKILL.md),
[`skills/template-engine-strict/SKILL.md`](../skills/template-engine-strict/SKILL.md),
and [`skills/template-engine/references/architecture.md`](../skills/template-engine/references/architecture.md).

## Local usage

Run these commands from `template-engine/`:

```bash
npm install       # Initial setup only; do not add packages during template work
cp .env.example .env.local
npm run dev
npm run build
```

The environment variables are optional for local default rendering. Keep
`.env.local` private.

## Adding a template — short brief

1. Create `templates/<slug>/` with `meta.ts`, `schema.ts`, `Template.tsx`, and
   `index.ts`; add `styles.css` when the template has local Tailwind styles.
2. Define the Zod schema, inferred content type, realistic `defaultContent`, and
   defensive renderer. Verify `contentSchema.safeParse(defaultContent)`.
3. Register the module in `templates/registry.ts` and its schema in
   `templates/schema-registry.ts`.
4. Keep the database `templates` catalog projection synchronized with metadata
   and `default_content` using the established database workflow. Code
   registration alone does not make a catalog row selectable.
5. Run root lint/typecheck, `npm --prefix template-engine run build`, and test
   editor fields, live preview, partial content, and responsive layouts.

See [`references/new-template.md`](../skills/template-engine/references/new-template.md)
for the complete checklist and compatibility guidance.
