# Lumous Travel One

A draft, single-page travel-agency template derived from the visual direction in
`DESIGN.md`. It includes navigation, hero, about, destinations, why-us,
testimonials, packages, contact, and footer sections in the order defined by
`Agent.md`.

## Content contract

- The schema is flat and editor-safe.
- Primary and secondary brand colors are editable six-digit hex values.
- All nine sections have independent boolean visibility controls.
- Copy, CTA labels and destinations, image URLs, and image alt text are editable.
- Empty image URLs use bundled, generated fallback photography.
- The v2 content contract replaces the original draft scaffold. Any locally
  saved v1 draft content must be recreated before publication.

## Interaction and motion

- GSAP provides scroll-linked image reveals, an About text scrub, and the pinned
  Why-us narrative at desktop widths.
- Testimonials use accessible previous/next controls.
- Packages use an accessible three-panel accordion.
- Reduced-motion preferences disable the scroll animation layer.

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

Both code registries include this slug. The template remains `draft` and no
database catalog row is created by this implementation. Before release, upload
a public thumbnail, set `meta.thumbnail`, and use the established database
administration process to synchronize metadata and `defaultContent`.
