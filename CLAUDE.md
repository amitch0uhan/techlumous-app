# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type check (no emit)
npm run format     # Prettier format all .ts/.tsx files
```

## Architecture

Next.js 16 App Router project with React 19, TypeScript (strict mode), Tailwind CSS v4, and shadcn/ui.

**Key conventions:**
- Path alias `@/` maps to the repo root
- UI components live in `components/ui/` — added via `npx shadcn@latest add <component>`
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — always use it for conditional class names
- Tailwind classes should pass through `cn()` or `cva()` so `prettier-plugin-tailwindcss` sorts them correctly (configured in `.prettierrc` via `tailwindFunctions`)

**Styling:**
- Design tokens are CSS custom properties defined in `app/globals.css` using `oklch()` color values
- Dark mode uses the `.dark` class variant (`@custom-variant dark (&:is(.dark *))`); toggled by pressing `d` (implemented in `components/theme-provider.tsx`)
- Fonts: `Inter` → `--font-sans`, `Manrope` → `--font-heading`, `Geist Mono` → `--font-mono`

**Component pattern:**
- `components/ui/` components wrap `@base-ui/react` primitives with `cva` variants and the `cn` utility
- Icons come from `@phosphor-icons/react`

**Prettier config (`.prettierrc`):** no semicolons, double quotes, 2-space indent, LF line endings, trailing commas (ES5).
