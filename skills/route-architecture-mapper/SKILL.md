---
name: route-architecture-mapper
description: Map a web application's route-level client, server, database, and external-service call chains into simple Mermaid UML-style diagrams. Use when the user wants to understand route behavior, user actions, or client/server/database relationships without changing application code.
metadata:
  short-description: Map route call chains visually
---

# Route Architecture Mapper

Create a visual architecture map for one or more application routes. The map is a documentation artifact: do not modify production code while tracing it.

## Deliverables

For every requested route, create a separate Markdown file containing:

- A route heading and a short purpose statement.
- A Mermaid `flowchart TD` diagram.
- A small legend for `client`, `server`, `db`, and `external` nodes.
- A concise verified call-chain summary and source-file links.

Use route subgraphs first, then action subgraphs inside each route. For the initial render, name the action `Initial render`. For user interactions, use the visible action name, such as `Create project`, `Delete project`, or `Fetch deployment status`.

Every function node must include the function/component name, the file it lives in, and its execution environment: `client`, `server`, `db`, or `external`.

## Workflow

1. Inspect repository guidance, route files, layouts, middleware/proxy files, server actions, services, database utilities, and client components. Start with `rg`/`rg --files`.
2. Resolve the route entry point and its parent layouts. Include proxy/middleware work that runs for the route.
3. Mark execution context from evidence:
   - `"use client"` means client component code.
   - `"use server"`, Server Actions, route handlers, layouts, pages, and service utilities are server-side unless explicitly client-only.
   - Supabase/Postgres table or RPC operations are database nodes, while the wrapper function remains a server node.
   - Vercel, OAuth, storage, or other network-provider calls are external nodes.
4. Trace the initial render recursively until reaching database, external, or terminal UI work. Include authentication and cookie/session refresh as part of the chain when they execute for the route.
5. Trace each user-visible action reachable from the route. Follow client handler → Server Action/Route Handler → service → database/external calls. Include validation, authorization, revalidation, redirects, and refreshes only when they materially explain the flow.
6. Check positive and conditional branches. Label branches such as `success`, `validation error`, `remote failure`, or `app-only fallback` rather than hiding them.
7. Write the diagram using [references/diagram-schema.md](references/diagram-schema.md). Keep node labels short enough to read, and use source links outside the diagram for detail.
8. Verify every named function and file with repository search. Do not invent calls. If behavior is inferred, label it `inferred` in the summary.
9. Do not edit application code, add instrumentation, run migrations, or call live services as part of mapping.

## Diagram conventions

- Top-level subgraph: `Route: /path`.
- Nested subgraphs: one for `Initial render`, then one per user action.
- Use solid arrows for normal calls and dotted arrows for conditional/error paths.
- Use distinct class styles for client, server, database, and external nodes.
- Include a shared `Proxy / session refresh` node when applicable instead of duplicating its internals in every action.
- Keep the diagram intentionally simple: function/file/environment nodes and call links, not every JSX element or type.

## Output location

Store route diagrams under `docs/architecture/routes/` using a kebab-case route name, for example `dashboard-home.md`. Keep this skill in `skills/route-architecture-mapper/` so it can be reused for later route requests.
