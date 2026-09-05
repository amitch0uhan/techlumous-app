# Template Engine Architecture

Use this reference only for template-related integration work. It intentionally
describes the narrow boundary with the main app and omits unrelated app logic.

## File Structure

```text
template-engine/
  app/
    globals.css          # Engine reset only
    layout.tsx           # Minimal published-site shell
    page.tsx             # Selects and renders one template
  component/             # Engine-owned shared runtime components
  lib/
    content.ts           # Reads published project content
  templates/
    types.ts             # TemplateModule and TemplateMeta contracts
    taxonomy.ts          # Allowed categories and suggested tags
    registry.ts          # Slug -> complete template module
    schema-registry.ts   # Slug -> Zod schema for studio operations
    <slug>/              # Self-contained template implementation
  .env.example
  next.config.ts
  package.json
  postcss.config.mjs
  tsconfig.json
```

The engine is its own Next.js application with its own dependencies, lockfile,
TypeScript config, build output, and environment file. Run package operations
against `template-engine`, not the repository root, when changing engine
dependencies.

## Data and Rendering Flow

```text
template schema + defaults
        |
        +--> studio schema form --> draft content --> publish validation
        |
        +--> studio iframe renderer (live content messages)
        |
        +--> selected-template deployment --> published_content --> ISR page
```

`template-engine/templates/` is the implementation source of truth. The root
app's TypeScript alias `@/templates/*` points to that folder, so the studio
preview and editor use the same component and schema as the published engine.

### Studio editor and preview

- `template-engine/templates/schema-registry.ts` exposes the schema by slug for
  generated form editing, image-field validation, and publish validation.
- `app/render/[slug]/page.tsx` and its live renderer load the complete template
  from `template-engine/templates/registry.ts`.
- The studio embeds this route in a same-origin iframe and sends content updates
  through the template live-message protocol. Templates do not need to know
  about that protocol; they only receive a new `content` prop.

When a schema changes, inspect the schema form only to confirm the field shape
is supported. Do not move editor UI or message handling into the template.

### Template catalog

The database `templates` catalog is separate from the code registries. Its row
is the studio-facing projection of `meta.ts` (excluding `status`) plus
`defaultContent`:

```text
slug, name, version, category, tags, description, thumbnail, default_content
```

Code registration alone makes a template renderable by slug but does not
guarantee it appears in the catalog. Keep the catalog row synchronized when a
template becomes selectable. This repository does not define a template seed
or insertion workflow in the engine; use the project's established database
administration/migration process rather than inventing a client-side write.

`meta.status` is code metadata (`published`, `draft`, or `deprecated`) and is
not part of the current catalog service schema. Do not assume changing it alone
publishes or hides a database catalog row.

### Published renderer

At runtime, `template-engine/app/page.tsx`:

1. Reads `TEMPLATE_SLUG` and resolves it through the registry.
2. Reads published content through `template-engine/lib/content.ts`.
3. Uses `defaultContent` only when the required environment pointers are absent
   or no content is returned.
4. Renders `<Template content={content} />` with ISR revalidation set to 60
   seconds.

The runtime environment contract is:

```text
TEMPLATE_SLUG
PROJECT_ID
SUPABASE_URL
SUPABASE_ANON_KEY
```

The anon key is intentionally public. RLS and column grants must restrict this
client to the selected project's published row and published-content columns.
Never substitute a service-role key. With configured pointers, query failures
throw; an ISR failure preserves the last successful page rather than silently
showing defaults.

### Deployment packaging

`lib/vercel/collect-files.ts` uploads the engine source with these important
rules:

- It includes only `templates/<selected-slug>/`, not other template folders.
- It omits the shared `templates/registry.ts` and generates a registry importing
  the selected template's exact `template` export.
- It excludes `templates/schema-registry.ts` and `templates/taxonomy.ts`.
- It includes engine-owned shared runtime files, subject to
  `template-engine/.gitignore`.
- It validates slugs against lowercase letters, digits, and hyphens.

Consequences:

- Never import another template from a template implementation.
- Do not make runtime rendering depend on the schema registry or taxonomy.
- Prefer template-local helpers and assets. A helper in
  `template-engine/component/` is shipped to every site and should be truly
  generic.
- Test the isolated engine build because the root build alone cannot prove that
  single-template packaging is self-contained.

## Change Impact Map

| Change | Required follow-through |
| --- | --- |
| `Template.tsx` or local CSS | Preview at responsive widths; isolated build; redeploy for existing live sites |
| `schema.ts` | Validate defaults; test generated editor; assess stored-content compatibility |
| `meta.ts` | Keep slug invariant; synchronize applicable catalog fields |
| New template folder | Add both code registries; prepare catalog row; test selected-slug build |
| Engine dependency | Update engine package and lockfile; isolated build |
| Remote `next/image` host | Narrowly update engine `next.config.ts`; isolated runtime test |
| Published-content query | Separate Supabase/RLS security review; never expand to drafts or writes implicitly |
| Shared engine component | Confirm it is generic and safe to ship with every selected template |

## Failure Guide

- **Unknown `TEMPLATE_SLUG`:** confirm folder slug, `meta.slug`, and
  `templates/registry.ts`; the error lists available registered slugs.
- **Template is renderable but absent from the picker:** confirm the database
  catalog row and its slug/default content.
- **Editor says schema is missing:** register the slug in
  `templates/schema-registry.ts`.
- **Editor control behaves like text unexpectedly:** the Zod construct lacks a
  dedicated normalizer/widget; use a supported shape or extend schema-form.
- **Image uploads fail field validation:** ensure the schema path exists and the
  field metadata uses `widget: "image"`.
- **Image renders in preview but fails when deployed:** verify the engine's
  `next/image` remote pattern and that the URL remains accessible publicly.
- **Root preview works but deployment build fails:** check imports outside the
  selected template/engine package and missing engine dependencies.
- **Saved draft is not live:** drafts are intentionally separate; publish it.
- **Published content changed but is not immediately visible:** allow the ISR
  revalidation window, currently about 60 seconds.
- **Component code changed but the live site did not:** deploy again; ISR updates
  content, not source code.

