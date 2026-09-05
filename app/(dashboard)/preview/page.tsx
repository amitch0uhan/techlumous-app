import Link from "next/link"
import { Suspense } from "react"

import { PreviewSkeleton } from "@/components/preview-skeleton"
import { TemplatePreviewWindow } from "@/components/template-preview-window"
import { buttonVariants } from "@/components/ui/button"
import { getRequestDeviceCapabilities } from "@/lib/device-capabilities.server"
import { cn } from "@/lib/utils"
import { getTemplate } from "@/services/template"

function PreviewPageFallback() {
  return (
    <div className="page">
      <div className="flex w-full justify-center pt-28">
        <PreviewSkeleton />
      </div>
    </div>
  )
}

async function PreviewContent({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const emptyState = (slug?: string) => (
    <div className="page">
      <div className="mt-8 flex flex-col items-center justify-center gap-10 overflow-x-clip">
        <div className="flex w-full justify-center pt-20">
          <PreviewSkeleton />
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

  const template = await getTemplate(slug)

  if (!template) {
    return emptyState(slug)
  }

  return (
    <TemplatePreviewWindow
      slug={template.slug}
      name={template.name}
      content={template.default_content}
      allowViewportResize={capabilities.canResizePreview}
    />
  )
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  return (
    <Suspense fallback={<PreviewPageFallback />}>
      <PreviewContent searchParams={searchParams} />
    </Suspense>
  )
}
