import { Suspense } from "react"

import PreviewContent from "@/components/preview-content"
import { EditorTopBarSkeleton } from "@/components/editor-top-bar-skeleton"
import { PreviewTemplateSkeleton } from "@/components/preview-skeleton"

function PreviewPageFallback() {
  return (
    <div className="relative isolate min-h-[calc(100dvh-4.2rem)] sm:-m-4 lg:-m-6">
      <div aria-hidden="true" className="editor-workspace-grid" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.2rem)] w-full max-w-7xl flex-col gap-3 p-3">
        <EditorTopBarSkeleton />
        <PreviewTemplateSkeleton />
      </div>
    </div>
  )
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; project?: string }>
}) {
  return (
    <Suspense fallback={<PreviewPageFallback />}>
      <PreviewContent searchParams={searchParams} />
    </Suspense>
  )
}
