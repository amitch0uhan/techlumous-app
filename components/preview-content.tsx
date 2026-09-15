import { getRequestDeviceCapabilities } from "@/lib/device-capabilities.server"
import { cn } from "@/lib/utils"
import { getTemplate } from "@/services/template"
import Link from "next/link"
import { PreviewEmptyState } from "./preview-empty-state"
import { TemplatePreviewWindow } from "./template-preview-window"
import { buttonVariants } from "./ui/button"
import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"

export default async function PreviewContent({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const emptyState = (slug?: string) => (
    <div className="page">
      <div className="mt-8 flex flex-col items-center justify-center gap-10 overflow-x-clip">
        <div className="flex w-full justify-center pt-20">
          <PreviewEmptyState />
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-75 text-muted-foreground/60 max-sm:pl-2">
            {slug
              ? `The "${slug}" template could not be found. Choose another from the template library.`
              : "No template is selected for this preview. Choose one from the template library."}
          </p>
          <Link href="/templates" className={cn(buttonVariants())}>
            View Templates
          </Link>
        </div>
      </div>
    </div>
  )

  const [{ template: requested }, capabilities] = await Promise.all([
    searchParams,
    getRequestDeviceCapabilities(),
  ])
  const slug = requested

  if (!slug) return emptyState()
  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")

  const template = await getTemplate(slug)

  if (!template) {
    return emptyState(slug)
  }

  return (
    <TemplatePreviewWindow
      slug={template.slug}
      name={template.name}
      content={template.default_content}
      design={template.default_design}
      allowViewportResize={capabilities.canResizePreview}
    />
  )
}
