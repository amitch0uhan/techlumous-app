import { redirect } from "next/navigation"
import Link from "next/link"
import { WarningOctagonIcon } from "@phosphor-icons/react/ssr"

import { TemplatePreviewWindow } from "@/components/template-preview-window"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { getTemplate } from "@/services/template"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  const emptyState = (slug?: string) => (
    <section className="relative isolate min-h-[calc(100dvh-4.2rem)] sm:-m-4 lg:-m-6">
      <div aria-hidden="true" className="editor-workspace-grid" />
      <div className="relative z-10 flex min-h-[calc(100dvh-4.2rem)] items-center justify-center p-3">
        <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
          <WarningOctagonIcon
            weight="duotone"
            className="size-14 text-muted-foreground"
          />
          <p className="max-w-75 text-sm/6 text-card-foreground">
            {slug
              ? `The "${slug}" template could not be found. Choose another from the template library.`
              : "No template is selected for this preview. Choose one from the template library."}
          </p>
          <Link href="/templates" className={cn(buttonVariants())}>
            View Templates
          </Link>
        </div>
      </div>
    </section>
  )

  const { template: requested } = await searchParams
  const slug = requested

  if (!slug) return emptyState()

  const template = await getTemplate(slug)

  if (!template) {
    return emptyState(slug)
  }

  return (
    <TemplatePreviewWindow
      slug={template.slug}
      name={template.name}
      content={template.default_content}
    />
  )
}
