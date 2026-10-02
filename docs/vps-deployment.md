# Deploying techlumous-app to the VPS (app.techlumous.com)

This guide covers deploying the Next.js app to your own VPS with GitHub Actions, PM2 and Nginx. It starts from the setup you already built for the static site. Each of those 19 steps is marked as reused, partially reused or not reused, and the new steps are listed in the order you run them.

Files in this repo that belong to this setup:

| File | Runs where | What it does |
| --- | --- | --- |
| `.github/workflows/deploy-app.yml` | GitHub Actions | Builds the app, packages a release, ships it, activates it, smoke-tests it, rolls back on failure |
| `deploy/release.sh` | VPS (streamed over SSH) | Unpacks a release, swaps the `current` symlink, restarts PM2, health-checks, keeps 3 releases, restores the previous one on failure |
| `deploy/ecosystem.config.cjs` | VPS (inside each release) | Tells PM2 how to start the Next.js server |
| `deploy/nginx/app.techlumous.com.conf` | VPS (`/etc/nginx/sites-available/`) | Nginx reverse proxy from the domain to the Node process |
| `package.json` → `"packageManager": "pnpm@11.15.0"` | GitHub Actions | Pins the pnpm version that `pnpm/action-setup` installs |

---

## 1. How the static site and the app differ

**Static site:** `next build` with `output: "export"` produces plain HTML, CSS and JS files. Nginx reads them from disk and returns them. No program needs to be running on the server.

**This app:** it has server-side code: Server Components that read cookies, Server Actions, API routes (`/api/auth/*`, `/api/webhooks/vercel`), the `proxy.ts` session refresh, and Partial Prerendering. That code only works if a Node.js process is running and answering requests. So this setup has three moving parts:

1. **A Node.js process.** It runs `server.js`, which `next build` creates because `next.config.ts` already sets `output: "standalone"`. It listens on `127.0.0.1:3000`, which only the VPS itself can reach.
2. **PM2.** This process manager starts that Node process, restarts it if it crashes, restarts it at server boot, and stores its logs.
3. **Nginx.** It still handles TLS on port 443, but instead of reading files it forwards every request to `127.0.0.1:3000` and sends the response back to the browser. This is called a **reverse proxy**.

### Request flow

```
Browser
  │  DNS lookup: app.techlumous.com → VPS IP (Cloudflare, DNS only)
  ▼
Nginx :443 (TLS certificate from certbot)
  │  proxy_pass
  ▼
Node.js :3000 on 127.0.0.1 (server.js, run by PM2)
  │
  ▼
/var/www/techlumous-app/current  →  releases/<release-id>
```

### Folder layout on the VPS

```
/var/www/techlumous-app/
├── current -> releases/20261001093000-ab12cd3     # symlink; what is live
├── releases/                                     # at most 3 folders
│   ├── 20261001093000-ab12cd3/
│   │   ├── server.js                # Next.js standalone server
│   │   ├── node_modules/            # only the packages the server needs (traced by Next)
│   │   ├── .next/                   # compiled server code + .next/static assets
│   │   ├── public/
│   │   ├── template-engine/         # source read at runtime by lib/vercel/collect-files.ts
│   │   └── ecosystem.config.cjs     # PM2 config
│   ├── 20260930180000-9f8e7d6/
│   └── 20260929120000-1a2b3c4/
├── shared/
│   └── .env                         # runtime secrets; never inside a release
└── incoming/                        # tarball lands here, deleted after unpacking
```

**Release:** one complete, self-contained copy of the built app in its own folder. Nothing is overwritten in place. A deploy adds a new folder and moves the `current` symlink to it. A rollback moves the symlink back to an older folder. Both are a single `rename()` system call, so there is never a half-updated app on disk.

---

## 2. Your 19 static-site steps: what carries over

Legend: **Reuse:** already done, nothing to do. **Reuse + action:** pattern done, needs a small per-site action. **Partial:** pattern reusable, needs changes for a server app. **Not used:** does not apply to this app.

| # | Step | Status for the app | What to do |
| --- | --- | --- | --- |
| 1 | VPS hardening (SSH keys, SSH hardening, UFW, Fail2ban, auto updates) | **Reuse** | Nothing. Do **not** open port 3000 in UFW; the app listens on `127.0.0.1` only and Nginx reaches it locally. |
| 2 | Cloudflare DNS A records, DNS only | **Reuse + action** | Add an `A` record `app` → VPS IP, grey cloud. Step B1. |
| 3 | Nginx installed, default site removed | **Reuse** | Nothing. |
| 4 | TLS via certbot `--nginx`, redirect, renew dry-run | **Reuse + action** | Run certbot once for `app.techlumous.com`. Step B3. Renewal is already automatic for every certificate. |
| 5 | rsync on VPS | **Reuse** | Nothing. The workflow rsyncs one tarball. |
| 6 | `deploy` user (no password, no sudo, in AllowUsers) | **Reuse** | Nothing. The same user owns the app folder and runs PM2. |
| 7 | Restricted ed25519 deploy key | **Reuse** | Nothing. The workflow runs commands over SSH without a PTY, which the `no-pty` restriction allows. |
| 8 | Host key pinned via `ssh-keyscan` | **Reuse** | Nothing. Same host, same `known_hosts` value. |
| 9 | Repo secrets `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SSH_HOST`, `SSH_PORT`, `SSH_USER` | **Reuse + action** | Secrets are per repository. If this app lives in a different repo from the static site, add the same five values here. Step C1. |
| 10 | Repo variables `DEV_/PROD_DEPLOY_PATH`, `SITE_URL`, secret `DEV_BASIC_AUTH` | **Partial** | One environment only, so no `DEV_`/`PROD_` pair and no basic auth. Add `APP_DEPLOY_PATH`, `APP_SITE_URL`, plus the app's build variables and one build secret. Step C2. |
| 11 | `/var/www/mysite-{dev,prod}/releases` owned by `deploy` | **Partial** | Same pattern, one folder: `/var/www/techlumous-app/{releases,shared,incoming}`, plus the `shared/.env` file. Steps A3–A4. |
| 12 | `next.config` `output: 'export'` | **Not used** | The app uses `output: "standalone"`, already set in `next.config.ts`. No change. |
| 13 | Verify job on PR, deploy job on push | **Reuse** (pattern) | Same shape: the `build` job runs on PRs to `main`; the `deploy` job runs only on push to `main` (or a manual run). |
| 14 | Branch → env selection via `ENV_PREFIX` + fail-fast config check | **Partial** | The fail-fast check is kept (two "Check … configuration" steps). Branch→env selection is dropped because there is one environment, deployed from `main`. |
| 15 | pnpm via `pnpm/action-setup`, `packageManager` pinned, `--frozen-lockfile`, build on runner | **Reuse + action** | `packageManager` was **not** pinned in this repo; it is now `"pnpm@11.15.0"`. Node is 22 on the runner. |
| 16 | Concurrency group per branch | **Reuse** (adjusted) | PR runs cancel older runs on the same branch. Deploys share one group and are never cancelled mid-way, so two deploys can't swap the symlink at the same time. |
| 17 | rsync to timestamped releases, atomic symlink swap, keep last 5 | **Partial** | Same release + symlink pattern, now **3 releases**, plus a PM2 restart, a local health check and automatic restore. Those live in `deploy/release.sh`. |
| 18 | Smoke test with optional basic auth | **Reuse** (simplified) | Same curl check against `https://app.techlumous.com/login`, no basic auth. A failure now also triggers a rollback. |
| 19 | Nginx static server block (`try_files`, cache headers, 404.html) | **Not used** | Replaced by a reverse-proxy server block. Next.js already sends `immutable` cache headers for `/_next/static/*` and handles 404s. Step B2. |

**New steps that the static site never needed:**

- PM2 installed and registered to start at boot (A2)
- Runtime env file on the VPS (A4)
- Nginx reverse proxy block (B2)
- Build-time env variables and secret in GitHub (C2)
- App-side URL configuration in Supabase and Vercel (D1)
- Release script with health check and rollback (already written: `deploy/release.sh`)

---

## 3. Step-by-step procedure

Run these in order. "As admin" means your normal sudo-capable SSH user. "As deploy" means `sudo -iu deploy` from the admin session, since `deploy` has no password.

### Phase A: VPS (one time)

#### A1. Check Node.js, the CPU architecture and port 3000

```bash
node -v          # must be v20.9+ (Next 16 minimum); v22 recommended to match the CI build
uname -m         # must print x86_64
ldd --version    # glibc distro (Ubuntu/Debian) — must not be Alpine/musl
sudo ss -ltnp | grep ':3000' || echo "port 3000 is free"
which node       # should be /usr/bin/node (system-wide)
```

Why each check matters:

- **CPU and libc.** The build runs on GitHub's `ubuntu-24.04` x86_64 runner. `sharp`, used by `next/image`, ships a compiled native binary for that platform inside `node_modules`. The binary only loads on an x86_64 glibc Linux. If your VPS is ARM (`aarch64`), change both `runs-on:` lines in the workflow to `ubuntu-24.04-arm`.
- **System-wide Node.** The workflow runs commands as `deploy` over a non-interactive SSH session. Such a session does **not** load `~/.bashrc`, so a Node installed through `nvm` for another user is invisible to `deploy`. A system-wide Node (for example from NodeSource's apt repo) lives in `/usr/bin` and every user sees it.

If Node is older than 20.9, or only available through nvm, install Node 22 system-wide:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### A2. Install PM2 and register it to start at boot

```bash
# as admin
sudo /usr/bin/npm install -g pm2@latest

# verify deploy can see both binaries BEFORE continuing
sudo -iu deploy bash -c 'command -v node; command -v pm2; node -v'
# expected: /usr/bin/node, /usr/bin/pm2, v22.x

sudo -iu deploy pm2 ping                       # creates ~/.pm2 for deploy, starts the PM2 daemon → { msg: 'pong' }
# clean PATH + full path: an nvm/per-user Node earlier in your admin PATH would
# otherwise be written into the systemd unit, which fails when run as deploy
sudo env PATH=/usr/bin:/bin /usr/bin/pm2 startup systemd -u deploy --hp /home/deploy
systemctl status pm2-deploy --no-pager
```

- With a system-wide Node (A1), `/usr/bin/npm install -g` puts the `pm2` binary in `/usr/bin`, where every user, including `deploy` over non-interactive SSH, can find it.
- **If `pm2 ping` fails with `-bash: line 1: pm2: command not found`:** `deploy` can't find a `pm2` binary in its `PATH`. This happens even when you run the command as root, because `sudo -iu deploy` uses `deploy`'s own environment. Usually Node/npm came from `nvm` (the binaries live under `/home/<admin>/.nvm` or `/root/.nvm`), or PM2 went into a per-user npm prefix (check with `npm prefix -g`). In both cases `deploy` can't see the binaries, and `sudo npm` may not even find `npm`, because `sudo` resets `PATH`. Fix: install Node 22 from NodeSource (A1), run `sudo /usr/bin/npm install -g pm2@latest`, and repeat the verify command above.
- **The PM2 daemon:** PM2 runs a background process (`God Daemon`) per Linux user. That daemon owns your app process. The daemon must belong to `deploy`, so the app runs as `deploy`, never root.
- `pm2 startup systemd -u deploy` writes a systemd unit (`pm2-deploy.service`). At boot, systemd starts PM2 as `deploy`, and PM2 runs `pm2 resurrect`. That command restarts whatever process list was last stored with `pm2 save`. `deploy/release.sh` runs `pm2 save` after every successful deploy, so a reboot brings back the live release.
- `sudo` is needed only for this one command, because it writes to `/etc/systemd/system/`. The `deploy` user stays without sudo.

Then install log rotation for PM2 (as deploy):

```bash
sudo -iu deploy pm2 install pm2-logrotate      # rotates ~/.pm2/logs at 10 MB, keeps 30 files by default
```

Without it, `~/.pm2/logs/techlumous-app-out.log` grows forever.

#### A3. Create the app folders

```bash
# as admin
sudo mkdir -p /var/www/techlumous-app/{releases,shared,incoming}
sudo chown -R deploy:deploy /var/www/techlumous-app
sudo chmod 750 /var/www/techlumous-app
```

This is the same pattern as step 11. `deploy` owns everything, because the workflow (connecting as `deploy`) creates release folders and moves the symlink without sudo. Nginx does **not** need read access here, because it never reads files from this folder; it only talks to port 3000.

#### A4. Create the runtime env file

```bash
# as deploy
sudo -iu deploy
nano /var/www/techlumous-app/shared/.env
chmod 600 /var/www/techlumous-app/shared/.env
```

Contents (prod values; copy from your local `.env.production` and fix the redirect URI):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<prod-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET=...
NEXT_PUBLIC_IMAGE_HOSTNAME=<prod-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
VERCEL_CLIENT_ID=...
VERCEL_CLIENT_SECRET=...
VERCEL_WEBHOOK_SECRET=...
VERCEL_REDIRECT_URI=https://app.techlumous.com/api/auth/vercel/callback
VERCEL_INTEGRATION_SLUG=...
```

**Build-time vs runtime variables.** `next build` copies the value of every `NEXT_PUBLIC_*` variable into the JavaScript bundle at build time, so those must be set in GitHub (C2). All other variables are read through `process.env` while the server runs, so they come from this file. PM2 starts Node with `--env-file=/var/www/techlumous-app/shared/.env` (see `deploy/ecosystem.config.cjs`), and Node loads the file into `process.env` before the app starts. The `NEXT_PUBLIC_*` values are repeated here so server code that reads them gets the same values. Keep both copies identical.

The file lives in `shared/`, outside the releases. Every release reads the same secrets, and the secrets are never part of a build artifact. The workflow also deletes any `.env*` file from the package before upload, because Next copies `.env` files into the standalone output when they exist at build time.

`chmod 600` means only `deploy` can read it.

### Phase B: Domain, Nginx, TLS (one time)

#### B1. Cloudflare DNS record

Cloudflare dashboard → techlumous.com → DNS → Add record:

| Type | Name | IPv4 address | Proxy status |
| --- | --- | --- | --- |
| A | `app` | your VPS IP | **DNS only** (grey cloud) |

This is the same as step 2. Grey cloud means browsers connect straight to your VPS, and certbot's HTTP-01 challenge can reach Nginx on port 80. Check it from your machine with `nslookup app.techlumous.com`. It must return the VPS IP before you run certbot.

> If you later switch the record to proxied (orange cloud), set Cloudflare SSL/TLS mode to **Full (strict)**. Otherwise Cloudflare and Nginx redirect each other in a loop.

#### B2. Nginx reverse-proxy site

Copy `deploy/nginx/app.techlumous.com.conf` to the server, then:

```bash
# as admin
sudo cp app.techlumous.com.conf /etc/nginx/sites-available/app.techlumous.com
sudo ln -s /etc/nginx/sites-available/app.techlumous.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

What each directive in the file does:

- `proxy_pass http://127.0.0.1:3000` forwards the request to the Node process.
- `proxy_set_header Host / X-Forwarded-Proto / X-Forwarded-Host / X-Forwarded-For` passes along the original domain, the original protocol (`https`) and the client IP. Without them, Next.js would see every request as `http://127.0.0.1:3000`. The Supabase and Vercel OAuth callbacks build redirect URLs from `new URL(request.url).origin`, so they would send users to the wrong address.
- `proxy_buffering off`: pages with Partial Prerendering send the static shell first and stream the dynamic parts later in the same response. With buffering on, Nginx holds the whole response until it finishes, which removes the benefit of streaming.
- `proxy_buffer_size 32k` (+ `proxy_buffers`, `proxy_busy_buffers_size`): the login callback (`/api/auth/supabase/callback`) sets the Supabase session as several large `Set-Cookie` headers. Nginx reads response headers into `proxy_buffer_size`, which defaults to 4–8 KB. When the headers don't fit, Nginx returns `502` and logs `upstream sent too big header`. `proxy_buffering off` doesn't change this, because it only affects the body.
- `large_client_header_buffers 4 32k`: after login the browser sends those cookies back in one `Cookie` header. The default 8 KB limit would cause `400 Request Header Or Cookie Too Large`.
- `client_max_body_size 10m`: Nginx's default limit is 1 MB. Server Actions accept up to 6 MB (`next.config.ts`), so uploads larger than 1 MB would fail with a `413` from Nginx.
- `proxy_read_timeout 120s`: the template deploy to Vercel runs inside a request and can exceed Nginx's 60 s default.

Security headers (HSTS, `X-Frame-Options`, CSP `frame-ancestors`, …) are **not** added in Nginx, because `next.config.ts` already sends them. Adding them in both places would duplicate the headers.

Until the first deploy, this domain returns `502 Bad Gateway` because nothing listens on port 3000 yet. That is expected.

#### B3. TLS certificate

```bash
# as admin
sudo certbot --nginx -d app.techlumous.com --redirect
sudo certbot renew --dry-run
```

This is the same as step 4. Certbot proves domain ownership over port 80, gets a Let's Encrypt certificate, and edits the site file. It adds a `listen 443 ssl` server block containing your `location /` proxy rules, and turns the port-80 block into a 301 redirect to HTTPS. The existing renewal timer (snap) renews this certificate together with the others.

Optional, for HTTP/2 (all current browsers support it; HTTP/1.1 also works everywhere): in `/etc/nginx/sites-available/app.techlumous.com`, inside the `listen 443 ssl` block, add `http2 on;` on Nginx ≥ 1.25.1 (`nginx -v`). On older Nginx, change the line to `listen 443 ssl http2;`. Then run `sudo nginx -t && sudo systemctl reload nginx`.

**Browser support:** TLS 1.2/1.3 from certbot's default Nginx config, plus Next.js's default browser targets (Chrome, Edge, Firefox, Safari, including iOS Safari), cover every current browser. Nothing else needs configuring.

### Phase C: GitHub repository settings (one time)

GitHub → this repository → Settings → Secrets and variables → Actions.

#### C1. Secrets (SSH; reused values)

| Secret | Value |
| --- | --- |
| `SSH_PRIVATE_KEY` | Same deploy private key as the static site |
| `SSH_KNOWN_HOSTS` | Same pinned `ssh-keyscan` line |
| `SSH_HOST` | VPS IP or hostname |
| `SSH_PORT` | Your SSH port |
| `SSH_USER` | `deploy` |

If this is the same repository as the static site, these already exist and nothing needs adding. Step 7 deleted the local private key. If this is a different repo and you no longer have the key, generate a new ed25519 key pair the same way as step 7, add the public key to `deploy`'s `authorized_keys` with the same restrictions, and store the new private key here.

#### C2. Build variables and secret (new)

**Variables** tab (not secret; visible in logs and inlined in the public JS bundle anyway):

| Variable | Value |
| --- | --- |
| `APP_DEPLOY_PATH` | `/var/www/techlumous-app` |
| `APP_SITE_URL` | `https://app.techlumous.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | prod Supabase URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | prod publishable key |
| `NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET` | bucket name |
| `NEXT_PUBLIC_IMAGE_HOSTNAME` | prod Supabase host, e.g. `<prod-ref>.supabase.co` |

**Secrets** tab:

| Secret | Why the build needs it |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | `next build` prerenders `/` and that page loads the template catalog through `createAdminClient()` (`services/template.ts`). Without the key the build fails with `supabaseKey is required` (verified). The key is only used during the build; it is not inlined in the bundle and is not shipped in the release. |

The prefixes `APP_` avoid clashing with the static site's `DEV_`/`PROD_` names if both live in one repo.

### Phase D: App configuration outside the server (one time)

#### D1. Point the external services at the new domain

These are not deployment steps, but the app's login and the Vercel integration break without them:

1. **Supabase (prod project) → Authentication → URL Configuration**
   - Site URL: `https://app.techlumous.com`
   - Redirect URLs: `https://app.techlumous.com/api/auth/supabase/callback`
   - OAuth providers (Google/GitHub/…): add `https://<prod-ref>.supabase.co/auth/v1/callback` in each provider console if not already there.
2. **Vercel integration settings**
   - Redirect URL: `https://app.techlumous.com/api/auth/vercel/callback` (must match `VERCEL_REDIRECT_URI` in `shared/.env`)
   - Webhook URL: `https://app.techlumous.com/api/webhooks/vercel`

### Phase E: First deploy

#### E1. Push the deployment files

These files are new or changed in your working tree and are not committed yet:

- `.github/workflows/deploy-app.yml`
- `deploy/release.sh`
- `deploy/ecosystem.config.cjs`
- `deploy/nginx/app.techlumous.com.conf`
- `docs/vps-deployment.md`
- `package.json` (`packageManager`)

Commit them on a branch (for example `chore/vps-deployment`) and open a PR to `main`. The PR runs only the **Build** job: lint, build and typecheck. A green PR check proves the GitHub build works with your variables before anything touches the VPS.

#### E2. Merge to `main` and watch the run

Merging pushes to `main`, which runs **Build** followed by **Deploy to VPS**. GitHub → Actions → "Deploy app" shows each step's log. Section 4 explains what each step does.

You can also start a deploy without a code change: Actions → Deploy app → **Run workflow** (on `main`). That is the `workflow_dispatch` trigger.

#### E3. Verify on the VPS

```bash
sudo -iu deploy
pm2 status                                 # techlumous-app → online
pm2 logs techlumous-app --lines 50         # Next.js "Ready" line, no errors
ls -l /var/www/techlumous-app/current      # → releases/<newest id>
curl -I http://127.0.0.1:3000/login        # 200
```

And from your browser: open `https://app.techlumous.com`, log in, open the editor, and deploy a template. That last action exercises the runtime read of `template-engine/`.

#### E4. Test rollback once

Reboot test: `sudo reboot`, wait, then open the site. PM2's systemd unit should bring the app back without a deploy.

Manual rollback test (see section 5). Do this now while nothing depends on the app, so you know rollback works before you need it.

---

## 4. What the workflow does, step by step

`.github/workflows/deploy-app.yml`

**Triggers**

| Event | Jobs that run |
| --- | --- |
| Pull request into `main` | `build` only. Nothing is deployed. |
| Push to `main` (including a PR merge) | `build` → `deploy` |
| Manual "Run workflow" on `main` | `build` → `deploy` |

**Concurrency.** Deploy runs share the group `deploy-app-production`. If you merge twice quickly, the second run waits for the first to finish instead of running in parallel. Running in parallel could let two releases swap `current` and restart PM2 at the same time. PR runs instead cancel the older run on the same branch, because only the newest commit matters.

### Job `build` (GitHub runner, ubuntu-24.04)

1. **Check out code.**
2. **Check build configuration.** Fails in a second with a clear `Missing …` error if a variable or secret from C2 is empty, instead of failing three minutes later inside `next build`.
3. **Set up pnpm.** Installs the exact pnpm version from `package.json` → `packageManager`.
4. **Set up Node.js 22.** Restores the pnpm package store from GitHub's cache (keyed by `pnpm-lock.yaml`), so repeat installs are fast.
5. **Install dependencies.** `--frozen-lockfile` fails if `package.json` and `pnpm-lock.yaml` disagree. This guarantees the build uses exactly the versions committed in the lockfile.
6. **Lint.** `pnpm lint`.
7. **Build.** `pnpm build` produces `.next/standalone/`, `server.js` and a trimmed `node_modules` with only what the server imports. Next works out that list by tracing imports. The build also type-checks.
8. **Typecheck.** `pnpm typecheck`. It runs after the build because `next build` generates `next-env.d.ts`, which `tsc` needs.
9. **Package release** (push/manual only). Assembles the folder that becomes `releases/<id>` on the VPS:
   - `.next/standalone/*`: the server and its `node_modules`.
   - `.next/static/`: hashed JS/CSS chunks. The standalone output intentionally leaves these out (Next expects a CDN or a copy step), so they are copied in.
   - `public/`: also left out of standalone by design, so it is copied in.
   - `template-engine/`: `lib/vercel/collect-files.ts` reads this folder from disk at runtime to upload template source to Vercel. `git archive` copies exactly the git-tracked files, so no stray local files or `node_modules` are included.
   - `ecosystem.config.cjs`: PM2 config.
   - Deletes `.env*`, so no env file can be shipped.
   - Packs everything into one `app-release.tar.gz`. A tarball keeps the symlinks pnpm creates inside `node_modules` and the file permissions. Uploading it as a GitHub artifact directly would lose both.
   - **Release id:** UTC timestamp + short commit SHA, e.g. `20261001093000-ab12cd3`. Sorting the names alphabetically also sorts them by time, which the pruning step relies on. The SHA tells you which commit a release came from.
10. **Upload release artifact.** Hands the tarball to the `deploy` job and keeps it for 7 days.

### Job `deploy` (GitHub runner → VPS)

1. **Check out deploy scripts.** Sparse checkout of only the `deploy/` folder.
2. **Check deploy configuration.** The same fail-fast idea for the SSH secrets and `APP_*` variables.
3. **Download release artifact.**
4. **Configure SSH.** Writes the private key and the pinned `known_hosts` entry, and an SSH config alias `vps`. `StrictHostKeyChecking yes` refuses to connect if the server's host key differs from the pinned one, the same protection as step 8.
5. **Upload release to VPS.** Creates `incoming/` and `releases/` if missing, then rsyncs the tarball to `incoming/<id>.tar.gz`.
6. **Activate release.** Streams `deploy/release.sh` over SSH with `activate`. On the VPS, the script:
   1. Fails immediately if `shared/.env` or the tarball is missing, or if `pm2`/`curl` are not in `PATH`.
   2. Unpacks the tarball into `releases/<id>` and deletes the tarball.
   3. Records which release `current` points to now (the "previous" release).
   4. Swaps `current` to the new release atomically: it creates `current.tmp` and renames it over `current`.
   5. Restarts the app. It runs `pm2 delete techlumous-app`, then `pm2 start <release>/ecosystem.config.cjs`, which starts `node --env-file=…/shared/.env server.js` with `PORT=3000`, `HOSTNAME=127.0.0.1` and `NODE_ENV=production`. PM2 is given the release's real path, not the symlink, so the process is tied to that exact release folder. Expect about 1–2 seconds in which Nginx answers `502` while the old process stops and the new one starts. For a single-server app this is the usual tradeoff, accepted instead of running two app instances.
   6. **Health check.** Requests `http://127.0.0.1:3000/login` up to 30 times, 2 seconds apart. It stops at the first `2xx`/`3xx` response.
   7. **Healthy:** runs `pm2 save` (so a reboot resurrects this release), then deletes all but the newest 3 release folders, never the live one. The step succeeds.
   8. **Unhealthy:** prints the last 50 PM2 log lines into the GitHub log, points `current` back to the previous release, restarts PM2, re-checks health, deletes the failed release folder, and exits with an error. On the very first deploy there is no previous release, so it stops the app instead.
7. **Smoke test.** From GitHub's runner, requests `https://app.techlumous.com/login` with up to 5 retries. This tests the whole public path: DNS, the TLS certificate, Nginx and the app. The local health check in the previous step only covers the app.
8. **Roll back to previous release.** Runs only if the smoke test failed **after** a successful activation. Runs `release.sh rollback`, which points `current` at the newest remaining release, restarts PM2, health-checks it, and deletes the failed release.

### What happens when each stage fails

| Failure | Production impact | Who restores |
| --- | --- | --- |
| Config check, install, lint, build, typecheck, packaging | None; nothing reached the VPS | Nothing to restore |
| SSH / upload | None; `current` unchanged | Nothing to restore (the tarball in `incoming/` is overwritten or removed next time) |
| App doesn't become healthy on `127.0.0.1:3000` | ~1–60 s of 502 during the check | `release.sh activate` restores the previous release itself |
| Public smoke test fails | Until the rollback step finishes | `Roll back to previous release` step |

In every failure case the GitHub run ends red, so a failed deploy is visible in the Actions tab and on the commit.

---

## 5. Day-to-day operations

All commands run as `deploy` on the VPS (`sudo -iu deploy`).

**Status and logs**

```bash
pm2 status
pm2 logs techlumous-app             # live tail; Ctrl+C to exit
pm2 logs techlumous-app --lines 200 --nostream
ls -1 /var/www/techlumous-app/releases
readlink -f /var/www/techlumous-app/current
```

**Manual rollback to the previous release**

```bash
cd /var/www/techlumous-app
ls -1 releases                                   # pick the release id to go back to
ln -sfn "$PWD/releases/<release-id>" current.tmp && mv -Tf current.tmp current
pm2 delete techlumous-app; pm2 start "$(readlink -f current)/ecosystem.config.cjs" && pm2 save
```

The next push to `main` deploys a new release as usual. To make a rollback permanent, revert the bad commit on `main` (`git revert`) so the next deploy doesn't bring the bad code back.

**Change a runtime secret** (`SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_*`)

1. Edit `/var/www/techlumous-app/shared/.env`.
2. Run `pm2 restart techlumous-app`. Node reads `--env-file` only at start, so a restart is required.
3. If the variable is also a GitHub variable or secret (C2), update it there too.

**Change a `NEXT_PUBLIC_*` value.** These values are baked into the bundle, so editing `shared/.env` is not enough. Update the GitHub variable **and** `shared/.env`, then redeploy (push or "Run workflow").

**Redeploy the same commit.** Actions → Deploy app → Run workflow.

**Disk usage.** At most 3 releases are kept. Check usage with `du -sh /var/www/techlumous-app/releases/*`.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Build step: `Missing repository variable/secret` | C2 not filled in | Add the named variable/secret |
| Build: `supabaseKey is required` | `SUPABASE_SERVICE_ROLE_KEY` secret missing | Add it (C2) |
| `Host key verification failed` | `SSH_KNOWN_HOSTS` missing or wrong for this host/port | Re-add the pinned line from step 8 |
| `pm2 not found in PATH for deploy` | PM2/Node installed per-user (nvm) | Install Node + PM2 system-wide (A1/A2) |
| `shared/.env is missing` | A4 skipped | Create it |
| Health check fails, log shows `Could not load the "sharp" module` | VPS is ARM or musl, build was x86_64 glibc | Use `ubuntu-24.04-arm` runners, or an x86_64 Ubuntu/Debian VPS |
| Health check fails, log shows `EADDRINUSE :3000` | Something else uses port 3000 | Stop it, or change `PORT` in `ecosystem.config.cjs` + `proxy_pass` in Nginx + `HEALTH_URL` in `release.sh` |
| Site shows `502 Bad Gateway` | App process not running | `pm2 status`, `pm2 logs techlumous-app` |
| Login redirects to `localhost` or `http://` | Missing `X-Forwarded-*` headers, or Supabase Site URL still old | Check B2 file and D1 |
| `502` only on `/api/auth/supabase/callback` (login) | Session `Set-Cookie` headers larger than Nginx's header buffer; error log shows `upstream sent too big header` | `proxy_buffer_size 32k` etc. in the site file (B2) |
| `400 Request Header Or Cookie Too Large` after login | Cookie header larger than 8 KB | `large_client_header_buffers 4 32k` (B2) |
| Image upload fails with `413` | Nginx body limit | `client_max_body_size` in the site file |
| App down after a VPS reboot | PM2 startup not registered, or `pm2 save` never ran | Redo A2's `pm2 startup` line; after a successful deploy, `pm2 save` runs automatically |
