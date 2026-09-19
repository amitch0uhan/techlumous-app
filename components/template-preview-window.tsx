"use client"

import { useState } from "react"

import {
  EditorTopBar,
  type PreviewViewport,
  type PreviewViewportPreset,
} from "@/components/editor-top-bar"
import {
  PreviewProjectAction,
  type PreviewProjectActionProps,
} from "@/components/preview-project-action"
import { ResizableTemplatePreview } from "@/components/resizable-template-preview"
import { TemplateAutoHeightPreview } from "@/components/template-auto-height-preview"
import { cn } from "@/lib/utils"

interface TemplatePreviewWindowProps {
  slug: string
  name: string
  content: unknown
  design: unknown
  allowViewportResize?: boolean
  projectAction?: PreviewProjectActionProps
  className?: string
}

export function TemplatePreviewWindow({
  slug,
  name,
  content,
  design,
  allowViewportResize = true,
  projectAction,
  className,
}: TemplatePreviewWindowProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop")

  const updateViewport = (nextViewport: PreviewViewportPreset) => {
    setViewport(nextViewport)
  }

  return (
    <section
      aria-label={`${name} preview`}
      className={cn(
        "relative isolate min-h-[calc(100dvh-4.2rem)] sm:-m-4 lg:-m-6",
        className
      )}
    >
      <div aria-hidden="true" className="editor-workspace-grid" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.2rem)] w-full max-w-7xl flex-col gap-3 p-3">
        <EditorTopBar
          title={name}
          viewport={viewport}
          onViewportChange={updateViewport}
          allowViewportResize={allowViewportResize}
          actions={
            projectAction ? <PreviewProjectAction {...projectAction} /> : null
          }
        />

        <div className="min-h-[calc(100dvh-6rem)] min-w-0 flex-1 overflow-hidden bg-white">
          {allowViewportResize ? (
            <ResizableTemplatePreview
              slug={slug}
              name={name}
              content={content}
              design={design}
              formReady
              viewport={viewport}
              isSchemaFormOpen={false}
              onManualResize={() => setViewport("custom")}
            />
          ) : (
            <TemplateAutoHeightPreview
              slug={slug}
              name={name}
              content={content}
              design={design}
              formReady
            />
          )}
        </div>
      </div>
    </section>
  )
}
