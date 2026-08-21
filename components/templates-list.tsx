import { TemplateCard } from "@/components/template-card"
import { listTemplates } from "@/services/template"

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export async function TemplatesList({ projectId }: { projectId?: string }) {
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
