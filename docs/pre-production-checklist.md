# Pre-production checklist — techlumous-app

Last verified 2026-09-30 on branch `fix/security-hardening` (first audit 2026-09-29).

**Priority key**

- **P0** — blocks launch: the live site breaks or is unsafe without it.
- **P1** — do before launch: needed for a dependable first release.
- **P2** — first week after launch.
- **P3** — later / nice to have.

**Tick key:** `[x]` done. Notes say _Verified_ (checked in code by Claude) or _Ticked by you_ (dashboard/prod item that can't be checked from the repo — the Supabase MCP is still connected to dev `jspq…`).

## 1. Supabase project switch (prod = `mgbe…`, dev = `jspq…`)

- [ ] **P0** Merge `chore/switch-supabase-project` (commit `75ad8b4`, local only, not on `main`). It holds the fixes below; until it's merged, `main` and `fix/security-hardening` still hardcode the dev host.
  - [x] `next.config.ts` image host reads `NEXT_PUBLIC_IMAGE_HOSTNAME`. _Verified on that branch._
  - [x] `template-engine/next.config.ts` image host reads `NEXT_PUBLIC_IMAGE_HOSTNAME`. _Verified on that branch._
  - [x] Template default image URLs use `NEXT_PUBLIC_IMAGE_HOSTNAME`; `lumous-studio-one/meta.ts` thumbnail URL removed (never read at runtime). _Verified on that branch: no `jspq…` reference left in code._
  - [x] Legacy templates `hello-world` and `lumous-mark-one` removed. _Verified on that branch._
- [x] **P0** Prod `public.templates.thumbnail` rows point at the `mgbe…` host (this column is what the studio renders). _Ticked by you._
- [x] **P0** Storage assets copied to prod: `techlumous` bucket (`templates/**`), thumbnails, and the user-upload bucket, with matching names, public/private flags, 5 MB limit, MIME allowlist. _Ticked by you._
- [x] **P0** Prod schema recreated: tables, RLS policies, anon column grants, Vault wrapper functions, triggers. _Ticked by you._
- [ ] **P1** Commit the schema as a migration (`supabase db dump` → `supabase/migrations/`). There's still no `supabase/` folder in the repo, so prod can't be rebuilt from code.
- [x] **P0** Templates catalog rows seeded in prod. _Ticked by you._
- [ ] **P1** Remove prod catalog rows (and any projects) for the deleted `hello-world` / `lumous-mark-one` templates.
- [x] **P1** Admin/pro rows set in prod `public.profiles`. _Ticked by you._
- [ ] **P1** Point the Supabase MCP / CLI at the prod project and re-run advisors (every advisor run so far was against dev).

## 2. Environment variables (Vercel project → Production)

- [ ] **P0** `.env.production` still has `VERCEL_REDIRECT_URI=http://localhost:3000/...`. Set `https://<prod-domain>/api/auth/vercel/callback` and register it on the Vercel integration.
- [ ] **P0** Set on the hosting provider (not only in the local `.env.production`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET`, `NEXT_PUBLIC_IMAGE_HOSTNAME`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_CLIENT_ID`, `VERCEL_CLIENT_SECRET`, `VERCEL_WEBHOOK_SECRET`, `VERCEL_REDIRECT_URI`, `VERCEL_INTEGRATION_SLUG`.
- [ ] **P0** Mark `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_CLIENT_SECRET`, `VERCEL_WEBHOOK_SECRET` as _Sensitive_.
- [x] **P0** No secret uses a `NEXT_PUBLIC_` prefix. _Verified in both env files and code._
- [x] **P0** Deployed template sites receive `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PROJECT_ID`, `TEMPLATE_SLUG`, `NEXT_PUBLIC_IMAGE_HOSTNAME`. _Verified on `chore/switch-supabase-project`; lands with the merge in section 1._
- [ ] **P1** Redeploy after changing any `NEXT_PUBLIC_*` value (they're inlined at build time).
- [ ] **P1** Rotate any secret ever pasted into chat, logs, or a shared machine; use a fresh `VERCEL_WEBHOOK_SECRET` for prod (the webhook route falls back to `VERCEL_CLIENT_SECRET` if it's unset).

## 3. Auth (Supabase dashboard → Authentication)

- [x] **P0** Open redirect in `app/api/auth/supabase/callback/route.ts`. _Verified: `safeNextPath()` committed in `8bc9057`._
- [ ] **P0** URL Configuration: Site URL = prod domain; Redirect URLs list only `https://<prod-domain>/api/auth/supabase/callback` (no localhost on the prod project).
- [ ] **P0** OAuth providers: prod client IDs, with the prod callback in each provider console.
- [ ] **P0** Test sign-up, login, logout, password reset, and an expired session end-to-end on prod.
- [x] **P1** Custom SMTP (the default Supabase mailer allows only a few emails/hour) and branded email templates.
- [ ] **P1** Enable **Leaked password protection** — https://supabase.com/docs/guides/auth/password-security
- [ ] **P2** Review auth rate limits; enable CAPTCHA if signup is public.

## 4. Security review

- [x] **P0** Service-role client can't be called from the browser. _Verified: `lib/supabase/server.ts` now starts with `import "server-only"` (was `"use server"`), committed in `8bc9057`; all importers are server files._
- [x] **P0** RLS is on for every public table in **prod**; test with the publishable key that one user can't read or write another user's `projects` / `user_integration`.
- [x] **P0** Project deletion checks ownership (there's no DELETE policy). _Verified: `deleteProject` compares session user to `userId` and filters `.eq("user_id", userId)`._
- [x] **P0** Server actions: each one re-checks the session user and ownership (don't trust `projectId` from the client). Not audited yet.
- [x] **P1** Free/pro project limit enforced server-side. _Verified: `createProject` rejects above `maxProjects` (free 1 / pro 5)._
- [ ] **P2** Enforce the project limit in the `projects` INSERT RLS policy too (a direct insert with the publishable key bypasses the server check).
- [x] **P1** Webhook `/api/webhooks/vercel`: HMAC check is timing-safe and processing is idempotent. _Verified: `shouldProcessVercelEvent` + ordered update filter._
- [x] **P1** Security headers, production only. _Verified: HSTS, nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`, committed in `8bc9057`._
- [ ] **P1** Confirm on a production build / Vercel preview that the editor's `/render/[slug]` preview iframe still loads and live-updates with the headers on.
- [x] **P1** Upload validation server-side. _Verified: `services/image.ts` enforces 5 MB and an avif/jpeg/png/webp allowlist._
- [x] **P1** `pnpm audit`; fix high/critical.
- [ ] **P1** Run `/security-review` on the final diff.
- [ ] **P3** Full CSP (`script-src`, `img-src`, `connect-src`), first as `Content-Security-Policy-Report-Only`.

## 5. Code cleanup

- [x] **P1** Remove debug logs: `services/user-integration.ts:193` (`console.log("HERER")`), `components/project-card.tsx:436`, `components/project-editor-workspace.tsx:174` (the last two print Vercel API responses in the browser).
- [ ] **P0** Commit or discard the 11 uncommitted files on `fix/security-hardening` (lint fixes, `eslint.config.mjs`, and dependency upgrades in `package.json` / `pnpm-lock.yaml`), merge both branches to `main`, deploy from `main` only.
- [ ] **P0** Dependency upgrades are uncommitted and untested (Next 16.2.6 → 16.3.6, Supabase, sharp, base-ui, …; `shadcn` dropped). Re-run build + smoke test before shipping them.
- [ ] **P2** Pick one package manager. Root uses `pnpm-lock.yaml`, `template-engine` uses `package-lock.json`; make sure Vercel's install command matches each.

## 6. Build & quality gates

- [x] **P0** `npm run typecheck` passes. _Verified 2026-09-30 on `fix/security-hardening` (with the uncommitted changes)._
- [x] **P1** `npm run lint` passes. _Verified 2026-09-30: exit 0, no errors, with the uncommitted `eslint.config.mjs` (`.worktrees/**` ignored) and lint fixes — commit them to keep it green._
- [ ] **P0** `npm run build` passes locally **with prod env values**. Not run yet.
- [ ] **P0** `template-engine` builds standalone (`cd template-engine && npm run build`) for each remaining template (`lumous-studio-one`, `lumous-travel-one`).
- [ ] **P0** Smoke test on a Vercel **Preview** deployment against prod Supabase:
  - [ ] **P0** login → dashboard → templates list (thumbnails load)
  - [ ] **P0** create project → edit in schema form → image upload → preview
  - [ ] **P0** connect Vercel integration → deploy → webhook updates status → live URL renders published content
  - [ ] **P1** delete project, disconnect integration, sign out
  - [ ] **P2** mobile visit to editor redirects with the "desktop required" notice
  - [ ] **P2** dark mode (`d` key) and 404 / `global-error` pages

## 7. Performance

- [ ] **P1** Check that `cacheComponents` pages don't cache per-user data across users.
- [ ] **P2** Add indexes for the unindexed FKs: `projects(template_id)`, `projects(user_id)`, `user_integration(token)` (flagged on dev; apply to prod).
- [ ] **P2** Lighthouse on `/login` and the dashboard: LCP image uses `priority`, no CLS.

## 8. SEO, metadata, and legal

- [ ] **P1** `app/layout.tsx` has no `metadata` export. Add `title`, `description`, `metadataBase`, Open Graph image, icons.
- [ ] **P1** Privacy Policy and Terms pages (required for the Vercel integration listing and OAuth consent screens).
- [ ] **P2** `app/robots.ts` (disallow the dashboard and `/render`); `sitemap.ts` only if there are public pages.
- [ ] **P3** Cookie/consent notice if analytics is added.

## 9. Infra, domain, and observability

- [ ] **P0** Custom domain + HTTPS on the hosting project; `www` ↔ apex redirect. HSTS is sent with `includeSubDomains`, so every subdomain must serve HTTPS.
- [ ] **P0** Vercel integration settings: prod redirect URL, webhook URL `https://<prod-domain>/api/webhooks/vercel`, scopes limited to what's used.
- [ ] **P1** Supabase prod: paid tier if needed (free projects pause after inactivity), backups / PITR, spend cap and alerts.
- [ ] **P1** Error tracking (e.g. Sentry); alert on 5xx and webhook `processing_failed`. None installed.
- [ ] **P2** Vercel Analytics / Speed Insights.
- [ ] **P2** Uptime monitor on `/login`.

## 10. Launch & rollback

- [ ] **P1** Rollback plan written down: Vercel "Promote previous deployment" + DB restore steps.
- [ ] **P1** After launch: watch logs for 24h and verify one real end-to-end deploy.
- [ ] **P2** Re-run Supabase advisors on prod after launch.
- [ ] **P3** Tag the release (`v0.1.0`) and bump `package.json` version (still `0.0.1`, no tags).

---

### Verification log

- **2026-09-29** — first audit on `chore/switch-supabase-project`. Typecheck pass; lint 914 errors / 11,854 warnings (mostly `.worktrees/`). Supabase advisors on dev: leaked password protection off, 3 unindexed FKs.
- **2026-09-30** — re-verified on `fix/security-hardening`. Typecheck pass, lint pass. `8bc9057` contains the redirect fix, `server-only` client, and security headers. Supabase-switch work sits unmerged on `chore/switch-supabase-project` (`75ad8b4`). Build, smoke tests, and every dashboard/prod item remain unverified from the repo.
