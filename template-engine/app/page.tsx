import type { Metadata } from "next"

import { getTemplate, listTemplates } from "@/templates/registry"

import { fetchProjectContent } from "../lib/content"

// Re-fetch the project's published content from Supabase at most once a minute.
// Saving a draft does not affect the live site; publishing does not redeploy it.
export const revalidate = 60

function resolveTemplate() {
  const slug =
    process.env.TEMPLATE_SLUG?.trim() || listTemplates()[0]?.meta.slug
  const template = slug ? getTemplate(slug) : undefined

  if (!template) {
    const available =
      listTemplates()
        .map((t) => t.meta.slug)
        .join(", ") || "none registered"
    throw new Error(
      `[template-engine] TEMPLATE_SLUG "${slug ?? ""}" was not found. ` +
        `Available templates: ${available}.`
    )
  }

  return template
}

export function generateMetadata(): Metadata {
  return { title: resolveTemplate().meta.name }
}

export default async function Page() {
  const template = resolveTemplate()
  console.log(
    `[template-engine] rendering "${template.meta.slug}" (${template.meta.name})`
  )

  const { Template, defaultContent } = template
  const content = (await fetchProjectContent()) ?? defaultContent
  return <Template content={content} />
}
