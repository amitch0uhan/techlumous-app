---
name: template-engine-strict
description: Enforce the non-negotiable implementation rules for Techlumous template-engine work. Use whenever an AI edits, creates, refactors, or reviews a template-engine template. Enforces the existing dependency allowlist and defensive handling of optional object and array content props.
metadata:
  short-description: Strict template implementation rules
---

# Strict Template-Engine Rules

These rules are mandatory for every change under `template-engine/` and every
template implementation that is shared with it. Apply them even when an AI
agent is running in auto-approval or auto-permission mode.

## 1. Dependency Allowlist Is Closed

Use only packages already present in `template-engine/package.json`.

- Do not add, upgrade, replace, remove, or install a package as part of a
  template change.
- Do not run `npm install`, `npm add`, `yarn add`, `pnpm add`, `npx` package
  installers, or equivalent dependency-changing commands.
- Do not edit `template-engine/package.json` or
  `template-engine/package-lock.json` to make a new import possible.
- Auto-permission, auto-approval, sandbox, or elevated execution mode never
  overrides this restriction.
- The only exception is an explicit user prompt in the current task that asks
  to install or add a specific package. If that happens, stop before changing
  dependencies, state the package and reason, and obtain the required command
  authorization through the normal tool flow. Do not infer permission from a
  request to implement a feature.
- If the requested implementation needs an unavailable package and the user
  has not explicitly requested its installation, do not work around the rule by
  changing package files. Report the missing dependency and ask for a decision.

Prefer the platform, React, Next.js, Zod, and utility packages already available
in the engine. Confirm an import exists in the engine's current
`package.json` before adding it to a template. A package installed only in the
repository root is not automatically available to the independently built
engine.

## 2. Every Object and Array Content Prop Must Be Defensive

Template content comes from editable or previously stored JSON. A schema's
`defaultContent` does not guarantee that an older, partial, or manually
provided payload has every nested object and array. Template renderers must
continue to render safely when an accepted object or array prop is omitted,
`null`, or partially populated.

### Required patterns

Use optional chaining and a safe fallback at every object/array boundary:

```tsx
// Object prop
<h1>{content.hero?.heading ?? ""}</h1>

// Array prop
{(content.links ?? []).map((link) => (
  <a key={link?.href ?? link?.label ?? "link"} href={link?.href ?? "#"}>
    {link?.label ?? ""}
  </a>
))}

// Nested array and object prop
{(content.features?.items ?? []).map((item, index) => (
  <article key={item?.id ?? item?.title ?? index}>
    <h2>{item?.title ?? ""}</h2>
    {(item?.meta ?? []).map((entry, metaIndex) => (
      <span key={entry?.label ?? metaIndex}>{entry?.value ?? ""}</span>
    ))}
  </article>
))}
```

Equivalent guarded forms such as `content.links?.map(...) ?? null` are valid.
The important requirement is that no missing value reaches an unsafe operation.

### Prohibited patterns

Do not introduce direct access that can throw when a content object is absent:

```tsx
content.hero.heading
content.features.items.map(renderItem)
content.links.length
content.footer.columns[0].items.map(renderItem)
```

Do not destructure nested content objects without a fallback:

```tsx
// Unsafe when content.hero is missing
const { heading } = content.hero
```

Use `const hero = content.hero ?? {}` and then `hero.heading ?? ""`, or access
the object with optional chaining directly. Do not use non-null assertions (`!`)
to bypass this rule.

Apply the rule to all nested values supplied through template content,
including values used for `map`, `filter`, `length`, indexing, spread, string
methods, event handlers, image props, URLs, and class-name construction. Use
safe scalar fallbacks (`""`, `"#"`, `false`, or a deliberate empty state) that
match the component's semantics.

Do not hide a broken required value with a random placeholder. Choose a
deterministic empty state that keeps the layout valid and is appropriate for
that field. For images, render the existing empty-image state when the URL is
missing; do not pass `undefined` to a component that requires a source.

## 3. Prefer Flat Content Props

Design every template's content contract as flat as practical:

- Prefer top-level scalar props such as `heroHeading`, `heroBody`, and
  `contactUrl` over nested object props such as `hero.heading` and
  `contact.url`.
- Prefer arrays of primitive values when the UI allows it. Avoid arrays of
  objects, especially arrays of objects nested inside another object or array.
- Do not introduce a nested object or an array of objects merely for visual
  grouping. Flatten it or use separate top-level props where that remains
  understandable and editable.
- If the requested design genuinely needs a nested object or array of objects,
  stop and flag the proposed shape to the user before implementation. Explain
  why a flat shape is insufficient and wait for confirmation; do not silently
  choose a complex schema.
- This gate applies to new templates and to new fields in existing templates.
  Do not silently flatten an existing template's stored schema because that is a
  breaking content migration; flag it and get explicit direction.

The defensive optional-chaining rule still applies to legacy nested templates.
Flat design is the default for new content, not permission to break existing
published JSON.

## 4. Keep the Template Boundary Intact

- Render from the `content` and `design` props only; do not fetch data or add database writes
  to a template.
- Keep template-specific CSS, fonts, helpers, and assets in the template's own
  folder.
- Do not import another template or root-app-only package. Deployment includes
  one selected template and the engine's existing files.
- `@/templates/fields` (the shared Zod field builders) and `@/templates/types`
  ship with every deployment and may be imported. `@/templates/schema-registry`
  and `@/templates/taxonomy` are excluded from packaging and must never be
  imported by a template.
- Shared code in `template-engine/component/` and `template-engine/hooks/` is
  shipped to every deployed site. Add to it only what depends purely on its own
  arguments; anything referencing a template's selectors, class prefixes,
  tokens, or content shape stays in that template's folder.
- Import shared engine files relatively (`../../hooks/use-carousel`). `@/`
  resolves differently in the engine build and the root app build.
- Do not alter auth, RLS, publishing, or unrelated studio behavior to make a
  template compile.

## 5. Colours Follow the Surface + Component Contract

Every template's editable colours follow the Colour system rules in
[the template-engine skill](../template-engine/SKILL.md). Reject or fix, before
completion:

- A flat, global colour list (`textStrong`, `border`, `onImage`) reused across
  unrelated elements instead of surface groups and per-component groups.
- A component category without its own colour group, or two different
  component categories sharing one group.
- A component that reads a raw palette var, or a text/border token used outside
  the surface it belongs to.
- A per-call-site colour switch prop (`onPanel`, `dark`, `inverse`) instead of a
  surface class.
- A background derived from a brand colour (`color-mix` of primary into a
  panel) with no control of its own, or an inline `style` colour.
- A hex default written anywhere other than the schema's `DEFAULT_COLORS`.
- A colour key that is not an industry role name, or an editor label that does
  not say where the colour shows.
- A filled component without its `foreground`, or no `effects.ring` focus
  colour.

## 6. Required Review Before Completion

Before reporting a template change complete:

1. Search the changed template for unsafe nested object access, direct `.map`,
   `.filter`, `.length`, indexing, and destructuring of content props.
2. Confirm every such access has optional chaining or a nullish/empty fallback.
3. Inspect the proposed content shape. If it adds nested objects or arrays of
   objects, confirm the user explicitly approved that exception.
4. Confirm every import is provided by the current
   `template-engine/package.json` or is a local/ platform import.
5. Confirm no dependency manifest or lockfile changed unless the user explicitly
   requested package installation.
6. Run the existing engine build and the relevant root checks; do not install
   anything to repair a failed check under this skill.
7. Test with complete defaults and with representative partial object/array
   content so the renderer remains usable instead of crashing.
8. Run the colour audit from rule 5: every rendered element maps to exactly
   one surface or component group, recorded in the template README.

If a requirement conflicts with these rules, pause and report the conflict. A
feature request does not silently waive either the closed dependency allowlist
or defensive content rendering.

## Separate content and design contract

Every module exports two inferred Zod types, two schemas and two defaults. Both
defaults must parse. Use `designSchema = z.object({})` and `defaultDesign = {}`
when there are no design controls. Travel One stores its surface + component
palette in nested `design.colors` groups; Hello World's theme remains content, and Mark One's fixed CSS
palette is unchanged. Register both schemas and design defaults in the studio
schema registry without importing renderers.

The studio uses independent Content/Design tabs with one save and publish flow.
Save both drafts atomically; validate both schemas before publishing. The iframe
applies a complete `{ content, design }` snapshot before acknowledging readiness.
The published engine selects `published_content,published_design` together and
never reads drafts. Each missing value falls back directly to its corresponding
template default. Keep colors exclusively in design storage and props; do not copy
them into content or add a compatibility resolver. Apply
`docs/template-content-design-migration.md` before rollout and refresh the catalog
cache. Source changes require a build; publishing either dataset uses ISR.
