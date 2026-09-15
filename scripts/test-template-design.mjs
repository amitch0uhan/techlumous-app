import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import ts from "typescript"

// Run with the installed compiler, without adding test dependencies.
const require = createRequire(import.meta.url)
const root = process.cwd()
const cache = new Map()
const mocks = new Map()
function load(file) {
  file = path.resolve(root, file)
  if (cache.has(file)) return cache.get(file).exports
  const loadedModule = { exports: {} }
  cache.set(file, loadedModule)
  const source = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText
  const localRequire = (name) => {
    if (mocks.has(name)) return mocks.get(name)
    if (name.endsWith(".css")) return {}
    if (name === "next/font/google")
      return new Proxy(
        {},
        { get: () => () => ({ style: { fontFamily: "test-font" } }) }
      )
    if (!name.startsWith(".") && !name.startsWith("@/")) return require(name)
    const base = name.startsWith("@/templates/")
      ? path.join(root, "template-engine", name.slice(2))
      : name.startsWith("@/")
        ? path.join(root, name.slice(2))
        : path.resolve(path.dirname(file), name)
    const resolved = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, "index.ts"),
    ].find((p) => existsSync(p) && /\.(ts|tsx)$/.test(p))
    assert.ok(resolved, `Cannot resolve ${name} from ${file}`)
    return load(resolved)
  }
  new Function("require", "module", "exports", source)(
    localRequire,
    loadedModule,
    loadedModule.exports
  )
  return loadedModule.exports
}

const slugs = ["hello-world", "lumous-mark-one", "lumous-travel-one"]
for (const slug of slugs) {
  const schema = load(`template-engine/templates/${slug}/schema.ts`)
  assert.ok(
    schema.contentSchema.safeParse(schema.defaultContent).success,
    `${slug} content defaults`
  )
  assert.ok(
    schema.designSchema.safeParse(schema.defaultDesign).success,
    `${slug} design defaults`
  )
}
const { defaultContent, defaultDesign, contentSchema, designSchema } = load(
  "template-engine/templates/lumous-travel-one/schema.ts"
)
const slug = "lumous-travel-one"
const snapshot = {
  content: defaultContent,
  design: {
    colors: {
      ...defaultDesign.colors,
      accentPrimary: "#444444",
      accentSecondary: "#333333",
    },
  },
}
assert.equal(snapshot.design.colors.accentPrimary, "#444444")
assert.equal(snapshot.design.colors.accentSecondary, "#333333")
assert.equal(snapshot.design.colors.canvas, defaultDesign.colors.canvas)
assert.deepEqual(snapshot.content, defaultContent)
assert.ok(contentSchema.safeParse(snapshot.content).success)
assert.ok(designSchema.safeParse(snapshot.design).success)
assert.equal(
  designSchema.safeParse({ colors: { canvas: "invalid" } }).success,
  false
)
const contentWithColors = contentSchema.parse({
  ...defaultContent,
  colors: defaultDesign.colors,
})
assert.ok(!("colors" in contentWithColors))

const { isTemplateLiveMessage, TEMPLATE_LIVE_CHANNEL } = load(
  "components/template-live-protocol.ts"
)
const update = {
  channel: TEMPLATE_LIVE_CHANNEL,
  type: "snapshot-update",
  slug,
  ...snapshot,
}
assert.ok(isTemplateLiveMessage(update))
for (const invalid of [
  { ...update, design: null },
  { ...update, content: [] },
  { channel: TEMPLATE_LIVE_CHANNEL, type: "snapshot-update", slug, content: {} },
])
  assert.equal(isTemplateLiveMessage(invalid), false)

const { collectEngineFiles } = load("lib/vercel/collect-files.ts")
for (const selected of slugs) {
  const files = await collectEngineFiles({ templateSlug: selected })
  const names = files.map((f) => f.file)
  assert.ok(!names.includes("templates/resolve.ts"))
  assert.ok(!names.includes("templates/schema-registry.ts"))
  for (const other of slugs.filter((s) => s !== selected))
    assert.ok(!names.some((n) => n.startsWith(`templates/${other}/`)))
  assert.ok(
    files
      .find((f) => f.file === "templates/registry.ts")
      .data.toString()
      .includes("TemplateModule<any, any>")
  )
  for (const file of files.filter((f) => /\.(ts|tsx)$/.test(f.file))) {
    for (const match of file.data
      .toString()
      .matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
      const name = match[1]
      if (!name.startsWith(".") && !name.startsWith("@/")) continue
      const base = name.startsWith("@/")
        ? name.slice(2)
        : path.posix.normalize(
            path.posix.join(path.posix.dirname(file.file), name)
          )
      assert.ok(
        [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].some((n) =>
          names.includes(n)
        ),
        `${selected}: ${file.file} -> ${name}`
      )
    }
  }
  console.log(
    `${selected}: defaults and ${files.length} packaged files verified`
  )
}
console.log(
  "PASS: separate defaults, canonical content, invalid design, protocol, and all deployment import closures"
)

// Server boundaries are replaced before importing actions: no network or writes.
for (const name of [
  "@/lib/supabase/server",
  "@/lib/vercel/deploy",
  "@/lib/vercel/projects",
  "@/services/image",
  "@/services/user-integration",
  "@/services/vault-secret",
  "@/services/template",
])
  mocks.set(name, {})
mocks.set("@/lib/supabase/auth", {
  requireAuthenticatedUserId: async () => "owner",
})
mocks.set("next/cache", { revalidatePath: () => {} })
const writes = []
mocks.set("@/services/project", {
  updateProject: async (id, payload) => writes.push({ id, payload }),
})
const { saveProjectDraftAction } = load("actions/project.ts")
const projectId = "00000000-0000-4000-8000-000000000001"
const saveResult = await saveProjectDraftAction(
  projectId,
  { brandName: "Incomplete draft" },
  { colors: { canvas: "invalid" } }
)
assert.equal(saveResult.status, "success", "incomplete drafts remain savable")
assert.deepEqual(writes.pop().payload, {
  draft_content: { brandName: "Incomplete draft" },
  draft_design: { colors: { canvas: "invalid" } },
})
assert.equal(
  (await saveProjectDraftAction(projectId, {}, null)).status,
  "error"
)
assert.equal(writes.length, 0)

const { orchestrateProjectDeployment } = load(
  "services/deployment-orchestrator.ts"
)
const project = {
  id: projectId,
  user_id: "owner",
  template_id: "template",
  draft_content: defaultContent,
  draft_design: defaultDesign,
  published_content: defaultContent,
  published_design: defaultDesign,
}
const state = {
  ...project,
  deploy_status: "ready",
  vercel_project_id: "vercel",
  deployment_url: "https://example.com",
}
const overrides = {
  getAuthenticatedUserId: async () => "owner",
  getProject: async () => project,
  getTemplateById: async () => ({
    slug,
    default_content: defaultContent,
    default_design: defaultDesign,
  }),
  getDeploymentState: async () => state,
  updateProject: async (id, payload) => writes.push({ id, payload }),
  cleanupProjectImages: async () => {},
}
project.draft_design = { colors: { canvas: "invalid" } }
assert.equal(
  (await orchestrateProjectDeployment(projectId, overrides)).code,
  "INVALID_CONTENT"
)
assert.equal(
  writes.length,
  0,
  "invalid design cannot partially publish content"
)
project.draft_design = defaultDesign
project.draft_content = { brandName: "Incomplete" }
assert.equal(
  (await orchestrateProjectDeployment(projectId, overrides)).code,
  "INVALID_CONTENT"
)
assert.equal(
  writes.length,
  0,
  "invalid content cannot partially publish design"
)
project.draft_content = defaultContent
assert.equal(
  (await orchestrateProjectDeployment(projectId, overrides)).ok,
  true
)
const firstRelease = writes.pop().payload
assert.deepEqual(firstRelease.published_design, defaultDesign)
assert.deepEqual(firstRelease.published_content, defaultContent)
assert.ok(!("colors" in firstRelease.published_content))
assert.ok(
  !("draft_content" in firstRelease),
  "live publish must not rewrite drafts"
)
project.draft_design = {
  colors: { ...defaultDesign.colors, canvas: "#123456" },
}
assert.equal(
  (await orchestrateProjectDeployment(projectId, overrides)).ok,
  true
)
const secondRelease = writes.pop().payload
assert.notEqual(
  firstRelease.deployed_content_hash,
  secondRelease.deployed_content_hash
)
assert.ok(!("colors" in secondRelease.published_content))
assert.equal(secondRelease.published_design.colors.canvas, "#123456")
console.log(
  "PASS: atomic incomplete draft saves, invalid publication guards, separate publication, and design-sensitive release hashes"
)

// Icons do not affect palette/markup assertions; avoid loading the entire icon catalog.
mocks.set("@phosphor-icons/react", new Proxy({}, { get: () => () => null }))
const React = require("react")
mocks.set("next/image", ({ src, alt, className }) =>
  React.createElement("img", { src, alt, className })
)
const { renderToStaticMarkup } = require("react-dom/server")
const { Template } = load(
  "template-engine/templates/lumous-travel-one/Template.tsx"
)
const html = renderToStaticMarkup(React.createElement(Template, snapshot))
assert.ok(html.includes("--color-lt-primary:#444444"))
assert.ok(html.includes("--color-lt-secondary:#333333"))
assert.ok(html.includes(`--color-lt-canvas:${defaultDesign.colors.canvas}`))
assert.equal((html.match(/--color-lt-[\w-]+:/g) ?? []).length, 17)
assert.ok(html.includes(defaultContent.brandName))
renderToStaticMarkup(React.createElement(Template, { content: {}, design: {} }))
console.log(
  "PASS: Travel One renders all 17 design variables and tolerates partial content/design"
)

for (const design of [
  { colors: null },
  { colors: [] },
  { colors: "invalid" },
]) {
  project.draft_design = design
  assert.equal(
    (await orchestrateProjectDeployment(projectId, overrides)).code,
    "INVALID_CONTENT"
  )
  assert.equal(writes.length, 0)
}
