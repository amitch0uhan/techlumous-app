# AI Guideline — Deploy a Site via GitHub (Vercel)

A prescriptive, copy-ready guideline for an AI agent implementing
**GitHub-connected deployments** through the Vercel REST API.

## Scope

**In scope:**

- Trigger a deployment from a GitHub repository ref or commit SHA
- Attach git metadata so Vercel links the deployment to the commit
- Poll `readyState` until the deployment reaches `READY` or `ERROR`
- Surface the live URL back to the user

**Out of scope:**

- How the access token was obtained (see `vercel-connect.md`)
- GitHub authentication / repo access (the user's Vercel account must already
  have the GitHub app installed and the repo connected to a Vercel project)
- Building or bundling code locally (Vercel's build system does this)
- File-upload deployments (see `vercel-deploy-files.md`)

> The single deliverable of this flow is: **a `READY` deployment triggered from
> a specific GitHub commit, with a live `url`.** The caller provides a
> `repoId`/`ref`/`sha`; this flow handles everything from trigger to URL.

---

## Mental model

```
CALLER              OUR SERVER                         VERCEL API          GITHUB
  │ deploy(repo,ref) ──►│                                   │                 │
  │                     │ POST /v13/deployments ───────────►│                 │
  │                     │  { gitSource: { type:"github",    │                 │
  │                     │    repoId, ref, sha } }           │ clone repo ────►│
  │                     │                                   │◄── source ──────│
  │                     │ returns deployment (QUEUED) ◄──── │                 │
  │                     │                                   │                 │
  │                     │ poll GET /v13/deployments/:id ───►│                 │
  │                     │   until readyState = READY|ERROR  │                 │
  │                     │◄── { url, readyState } ───────────│                 │
  │◄── url ────────────│                                   │                 │
```

Key difference from file-upload: **there is no Step 1.** Vercel clones the
repository itself using the GitHub app credentials attached to the user's
account. You only need to tell Vercel _which commit_ to build.

Two invariants:

1. **The Vercel project must already be linked to the GitHub repo.** If it
   isn't, the deployment will fail with a 404 or permission error. Linking is
   a one-time setup done in the Vercel dashboard or via the Projects API —
   not in this flow.
2. **`repoId`, not repo name.** Use GitHub's numeric repository ID (stable
   across renames) not the `owner/repo` slug. Obtain it once and store it in
   `user_integration.credentials`.

---

## Prerequisites

| Variable              | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `VERCEL_ACCESS_TOKEN` | Bearer token from the OAuth flow                 |
| `VERCEL_TEAM_ID`      | Optional — required when deploying to a team     |

Additionally, the caller must supply:

| Input        | Type   | Description                                           |
| ------------ | ------ | ----------------------------------------------------- |
| `projectId`  | string | Vercel project ID (e.g. `prj_...`) or project slug   |
| `repoId`     | number | GitHub numeric repo ID                                |
| `ref`        | string | Branch or tag name (e.g. `"main"`, `"v1.2.3"`)       |
| `sha`        | string | Full 40-char commit SHA to deploy                     |
| `target`     | string | `"production"` or omit for preview                   |

---

## Step 1 — Create the deployment

```
POST https://api.vercel.com/v13/deployments
  ?teamId=<VERCEL_TEAM_ID>          ← omit if personal account
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "<project-slug>",
  "project": "<projectId>",
  "gitSource": {
    "type": "github",
    "repoId": 123456789,            ← numeric GitHub repo ID
    "ref": "main",                  ← branch or tag
    "sha": "dc36199b2234c6586ebe05ec94078a895c707e29"
  },
  "gitMetadata": {
    "remoteUrl": "https://github.com/<owner>/<repo>",
    "commitRef": "main",
    "commitSha": "dc36199b2234c6586ebe05ec94078a895c707e29",
    "commitMessage": "<your commit message>",
    "commitAuthorName": "<author>",
    "commitAuthorEmail": "<email>"
  },
  "target": "production"           ← or omit for "preview"
}
```

**`gitMetadata` is optional but recommended** — it makes the deployment appear
correctly in the Vercel dashboard (commit message, author, branch) and is
required if you want to show deployment status back on the GitHub commit.

**Response:** a deployment object with `id`, `url`, and `readyState` (initially
`QUEUED` or `INITIALIZING`). Persist `id` immediately.

---

## Step 2 — Poll readyState

Identical to the file-upload flow:

```
GET https://api.vercel.com/v13/deployments/<id>
  ?teamId=<VERCEL_TEAM_ID>
Authorization: Bearer <token>
```

Poll on a **10-second interval** (GitHub builds take longer than static file
deployments — typically 1–5 minutes). Use exponential back-off, cap at 60 s.

| `readyState`   | Action                                             |
| -------------- | -------------------------------------------------- |
| `QUEUED`       | Wait, keep polling                                 |
| `INITIALIZING` | Wait, keep polling                                 |
| `BUILDING`     | Wait, keep polling (this state lasts longest)      |
| `READY`        | Done — read `url` from response, surface to caller |
| `ERROR`        | Read `errorMessage` / `errorCode`, surface failure |
| `CANCELED`     | Treat as failure                                   |

**Timeout:** abort polling after 20 minutes and surface a timeout error. GitHub
builds include install + build steps which can be slow on first run.

---

## Step 3 — Surface the result

On `READY`:

```ts
return {
  status: "ready",
  url: `https://${deployment.url}`,
  deploymentId: deployment.id,
  inspectorUrl: deployment.inspectorUrl,
  gitSource: deployment.gitSource,  // echoed back: { sha, ref, repoId }
}
```

On `ERROR`:

```ts
return {
  status: "error",
  errorMessage: deployment.errorMessage,
  errorCode: deployment.errorCode,
  deploymentId: deployment.id,
  inspectorUrl: deployment.inspectorUrl,
}
```

---

## Redeploying the latest commit on a branch

If you want to always deploy the latest commit on a branch (rather than a
pinned SHA), use `withLatestCommit`:

```json
{
  "name": "<project-slug>",
  "project": "<projectId>",
  "deploymentId": "<previous-dpl_...>",
  "withLatestCommit": true
}
```

This forces Vercel to fetch the latest SHA on the branch even when providing
a `deploymentId`. Useful for "deploy HEAD of main" UX.

---

## Comparing file-upload vs GitHub flow

| Concern               | File upload                        | GitHub                              |
| --------------------- | ---------------------------------- | ----------------------------------- |
| Who builds the code?  | You do (locally)                   | Vercel (clones + runs build cmd)    |
| Step 1                | Upload files (per-file POST)       | None — just the deployment POST     |
| Input                 | Build output directory             | Repo ID + branch + SHA              |
| Build time            | Fast (static files only)           | Slower (installs deps, runs build)  |
| Git history visible?  | No                                 | Yes (Vercel dashboard shows commit) |
| Framework detection   | You set `framework: null`          | Vercel auto-detects from repo       |
| Re-use unchanged files| Yes (SHA dedup)                    | Yes (layer cache in build system)   |
| Requires GitHub app   | No                                 | Yes (installed on Vercel account)   |

---

## Error reference

| HTTP | Likely cause                                                 |
| ---- | ------------------------------------------------------------ |
| 400  | Missing `name`, bad `gitSource`, auto-detection mismatch    |
| 401  | Token expired or revoked — re-run connect flow               |
| 403  | GitHub app not installed or repo not linked to Vercel project|
| 404  | `repoId` not found or project not found                      |
| 409  | Concurrent identical deployment already in progress          |
| 429  | Rate limit — back off and retry                              |
