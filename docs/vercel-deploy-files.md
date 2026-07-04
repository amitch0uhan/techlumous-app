# AI Guideline — Deploy a Site via File Upload (Vercel)

A prescriptive, copy-ready guideline for an AI agent implementing
**file-based deployments** through the Vercel REST API.

## Scope

**In scope:**

- Upload build output files to Vercel (get a SHA per file)
- Create a deployment that references those SHAs
- Poll `readyState` until the deployment reaches `READY` or `ERROR`
- Surface the live URL back to the user

**Out of scope:**

- How the access token was obtained (see `vercel-connect.md`)
- Building the project locally (your build pipeline owns that — hand off the
  build output directory here)
- Git-connected deployments (see `vercel-deploy-github.md`)

> The single deliverable of this flow is: **a `READY` deployment with a live
> `url`.** The caller provides build output files; this flow handles everything
> from upload to URL.

---

## Mental model

```
CALLER           OUR SERVER                          VERCEL API
  │ deploy(files) ──►│                                    │
  │                  │ for each file:                     │
  │                  │   POST /v2/files (SHA + bytes) ───►│ 200 (or 409 if
  │                  │                                    │  already known)
  │                  │ POST /v13/deployments ────────────►│ returns deployment
  │                  │   { files: [{file, sha, size}] }   │  object (QUEUED)
  │                  │                                    │
  │                  │ poll GET /v13/deployments/:id ─────►│
  │                  │   until readyState = READY|ERROR   │
  │                  │◄── { url, readyState } ────────────│
  │◄── url ─────────│                                    │
```

Two invariants:

1. **Files are content-addressed.** Vercel deduplicates by SHA — uploading the
   same file twice is a no-op (returns 409, which is a success case). Always
   compute the SHA before uploading; never assume the file is new.
2. **Upload before create.** The deployment request references files by SHA.
   If a SHA is unknown to Vercel the deployment will fail. Upload all files
   first, then create the deployment in a single request.

---

## Prerequisites

| Variable               | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `VERCEL_ACCESS_TOKEN`  | Bearer token from the OAuth flow                 |
| `VERCEL_TEAM_ID`       | Optional — required when deploying to a team     |

These come from the vault-backed `user_integration` row created by
`vercel-connect.md`. Retrieve the token via `getVaultSecret(row.token)`.

---

## Step 1 — Upload files

For each file in the build output:

```
POST https://api.vercel.com/v2/files
Authorization: Bearer <token>
Content-Type: application/octet-stream
x-vercel-digest: <sha1-hex>     ← SHA-1 of the raw file bytes
Content-Length: <byte-length>

<raw bytes>
```

**Response codes:**

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| 200    | File stored successfully                       |
| 409    | File already known (dedup hit) — treat as OK   |
| 4xx    | Abort; surface error to caller                 |

Collect `{ file: "relative/path", sha: "<sha1>", size: <bytes> }` for every
file (whether uploaded fresh or dedup'd). This array goes into Step 2.

**Practical limits:**

- Max file size per upload: 100 MB
- Files under ~1 KB can alternatively be inlined (see *Inlining small files*
  below), but prefer SHA-reference for consistency

---

## Step 2 — Create the deployment

```
POST https://api.vercel.com/v13/deployments
  ?teamId=<VERCEL_TEAM_ID>          ← omit if personal account
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "<project-slug>",         ← required; becomes the deployment URL prefix
  "files": [
    { "file": "index.html", "sha": "<sha1>", "size": 1234 },
    { "file": "assets/app.js", "sha": "<sha1>", "size": 56789 }
    // ... all files from Step 1
  ],
  "projectSettings": {
    "framework": null,              ← null = no framework (static site)
    "outputDirectory": "."          ← root of the uploaded files
  },
  "target": "production"           ← or omit for "preview"
}
```

**Response:** a deployment object with `id`, `url`, and `readyState` (initially
`QUEUED` or `INITIALIZING`). Persist `id` immediately — it is needed for
polling and for linking the deployment record in your DB.

---

## Step 3 — Poll readyState

```
GET https://api.vercel.com/v13/deployments/<id>
  ?teamId=<VERCEL_TEAM_ID>
Authorization: Bearer <token>
```

Poll on a **5-second interval** with **exponential back-off** (cap at 30 s).
Typical build time for a static site is 10–30 s.

| `readyState`   | Action                                             |
| -------------- | -------------------------------------------------- |
| `QUEUED`       | Wait, keep polling                                 |
| `INITIALIZING` | Wait, keep polling                                 |
| `BUILDING`     | Wait, keep polling                                 |
| `READY`        | Done — read `url` from response, surface to caller |
| `ERROR`        | Read `errorMessage` / `errorCode`, surface failure |
| `CANCELED`     | Treat as failure                                   |

**Timeout:** abort polling after 10 minutes and surface a timeout error.

---

## Step 4 — Surface the result

On `READY`:

```ts
return {
  status: "ready",
  url: `https://${deployment.url}`,
  deploymentId: deployment.id,
  inspectorUrl: deployment.inspectorUrl,
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

## Inlining small files (alternative to upload)

Files ≤ a few KB can be sent inline in the deployment body instead of a
separate upload step. Use `data` + `encoding` instead of `sha` + `size`:

```json
{
  "file": "robots.txt",
  "data": "User-agent: *\nDisallow:",
  "encoding": "utf-8"
}
```

Use `"encoding": "base64"` for binary files. Prefer SHA-reference for
everything else — inlining bloats the deployment request.

---

## Redeploying

To redeploy a previous deployment without re-uploading files:

```json
{
  "name": "<project-slug>",
  "deploymentId": "<previous-dpl_...>",
  "withLatestCommit": false
}
```

All `files`, `projectSettings`, and `target` are inherited from the original.
Override any field you want to change.

---

## Error reference

| HTTP | Likely cause                                            |
| ---- | ------------------------------------------------------- |
| 400  | Missing `name`, bad `files` array, unknown SHA          |
| 401  | Token expired or revoked — re-run connect flow          |
| 402  | Plan limit exceeded (regions, concurrency)              |
| 403  | Token lacks deployment scope                            |
| 409  | Deployment conflict (concurrent identical deploy)       |
| 429  | Rate limit — back off and retry                         |
