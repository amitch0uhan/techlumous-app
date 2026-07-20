"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { saveProjectContentAction } from "@/actions/project"
import { TemplateAutoHeightPreview } from "@/components/template-auto-height-preview"
import {
  TemplateSchemaEditForm,
  type TemplateSchemaEditFormPosition,
} from "@/components/template-schema-edit-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { getTemplateContentSchema } from "@/templates/schema-registry"

type PanelPosition = TemplateSchemaEditFormPosition

interface ProjectEditorWorkspaceProps {
  projectId: string
  projectName: string
  template?: {
    name: string
    slug: string
    initialContent: unknown
  } | null
}

const PANEL_POSITION_KEY = "techlumous:editor-panel-position"
const PANEL_POSITION_EVENT = "techlumous:editor-panel-position-change"

function getPanelPosition(): PanelPosition {
  const savedPosition = window.localStorage.getItem(PANEL_POSITION_KEY)
  return savedPosition === "left" || savedPosition === "right"
    ? savedPosition
    : "right"
}

function subscribeToPanelPosition(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PANEL_POSITION_KEY) onStoreChange()
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(PANEL_POSITION_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(PANEL_POSITION_EVENT, onStoreChange)
  }
}

export function ProjectEditorWorkspace({
  projectId,
  projectName,
  template,
}: ProjectEditorWorkspaceProps) {
  const contentSchema = useMemo(
    () => (template ? getTemplateContentSchema(template.slug) : undefined),
    [template]
  )

  const [content, setContent] = useState<unknown>(
    () => template?.initialContent
  )
  const [savedContent, setSavedContent] = useState<unknown>(
    () => template?.initialContent
  )
  const [isSaving, setIsSaving] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const router = useRouter()
  const isDirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedContent),
    [content, savedContent]
  )

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const result = await saveProjectContentAction(projectId, content)
    setIsSaving(false)

    if (result.status === "success") {
      setSavedContent(content)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }, [content, projectId])

  useEffect(() => {
    const editorUrl = window.location.href

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ""
    }

    const handlePopState = () => {
      if (!isDirty) return

      const destination =
        window.location.pathname + window.location.search + window.location.hash
      window.history.pushState(
        { ...(window.history.state ?? {}), unsavedChangesGuard: true },
        "",
        editorUrl
      )
      setPendingHref(destination)
      setShowLeaveDialog(true)
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!isDirty || event.defaultPrevented || event.button !== 0) return

      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest("a")
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return
      }

      const href = link.href
      if (!href || new URL(href).origin !== window.location.origin) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      event.preventDefault()
      setPendingHref(new URL(href).pathname + new URL(href).search)
      setShowLeaveDialog(true)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    if (isDirty) {
      window.history.pushState(
        { ...(window.history.state ?? {}), unsavedChangesGuard: true },
        "",
        editorUrl
      )
      window.addEventListener("popstate", handlePopState)
    }
    document.addEventListener("click", handleDocumentClick, true)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
      document.removeEventListener("click", handleDocumentClick, true)
    }
  }, [isDirty])

  const leavePage = () => {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
    setShowLeaveDialog(false)
  }

  const handleFormReady = useCallback(() => {
    setFormReady(true)
  }, [])

  const panelPosition = useSyncExternalStore<PanelPosition>(
    subscribeToPanelPosition,
    getPanelPosition,
    () => "right"
  )

  const updatePanelPosition = (position: PanelPosition) => {
    window.localStorage.setItem(PANEL_POSITION_KEY, position)
    window.dispatchEvent(new Event(PANEL_POSITION_EVENT))
  }

  return (
    <section
      aria-label={`${projectName} editor workspace`}
      data-project-id={projectId}
      className="relative isolate min-h-[calc(100dvh-4.2rem)]"
    >
      <div aria-hidden="true" className="editor-workspace-grid" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.2rem)] w-full max-w-7xl items-start gap-3 p-3">
        <div
          className={cn(
            "min-h-[calc(100dvh-6rem)] min-w-0 flex-1 overflow-hidden bg-white",
            panelPosition === "left" && "order-2"
          )}
        >
          {template ? (
            <TemplateAutoHeightPreview
              slug={template.slug}
              name={template.name}
              content={content}
              formReady={formReady}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-card px-6 text-center text-sm text-muted-foreground">
              Select a template to start editing this project.
            </div>
          )}
        </div>

        <TemplateSchemaEditForm
          position={panelPosition}
          onPositionChange={updatePanelPosition}
          schema={contentSchema}
          value={content}
          onChange={setContent}
          onReady={handleFormReady}
          onSave={handleSave}
          isDirty={isDirty}
          isSaving={isSaving}
        />
      </div>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-accent-foreground!">
              Leave without saving?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be lost if you leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingHref(null)}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction onClick={leavePage}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
