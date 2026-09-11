import { TemplateCard } from "@/components/template-card"
import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { listTemplates } from "@/services/template"
import { redirect } from "next/navigation"

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export async function TemplatesList({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project: projectId } = await searchParams
  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")
  const templates = await listTemplates()

  if (templates.length === 0) {
    return (
      <p className="font-mono text-sm text-card-foreground/40">
        No templates available yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          templateId={template.id}
          title={template.name}
          type={formatCategory(template.category)}
          image={template.thumbnail}
          slug={template.slug}
          projectId={projectId}
        />
      ))}
    </div>
  )
}
