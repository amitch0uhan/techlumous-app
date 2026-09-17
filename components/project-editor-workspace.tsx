"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  deployProjectAction,
  fetchDeploymentStatusAction,
  getProjectDeploymentAction,
  type DeploymentActionSnapshot,
} from "@/actions/deploy"
import { saveProjectDraftAction } from "@/actions/project"
import {
  showInvalidFieldsToast,
  showVercelReconnectToast,
} from "@/components/deploy-blocked-toast"
import {
  EditorTopBar,
  type PreviewViewport,
  type PreviewViewportPreset,
} from "@/components/editor-top-bar"
import { ResizableTemplatePreview } from "@/components/resizable-template-preview"
import { TemplateSchemaEditForm } from "@/components/template-schema-edit-form"
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
import {
  getTemplateContentSchema,
  getTemplateDesignSchema,
} from "@/templates/schema-registry"
import { isActiveDeploymentStatus } from "@/types/deployment"
import { getSchemaErrors, getSchemaIssues } from "@/lib/schema-form"
import { cn } from "@/lib/utils"

// Tooltip blockers disable the deploy button; the rest explain themselves on click.
type DeployBlocker =
  | { type: "tooltip"; message: string }
  | { type: "invalid-content" }
  | { type: "vercel-reconnect" }

interface ProjectEditorWorkspaceProps {
  projectId: string
  projectName: string
  template?: {
    name: string
    slug: string
    initialContent: unknown
    initialDesign: unknown
  } | null
  initialDeployment: DeploymentActionSnapshot
  hasLiveDeployment: boolean
  initialPublishedContent: unknown
  initialPublishedDesign: unknown
  isVercelConnected: boolean
}

export function ProjectEditorWorkspace({
  projectId,
  projectName,
  template,
  initialDeployment,
  hasLiveDeployment: initialHasLiveDeployment,
  initialPublishedContent,
  initialPublishedDesign,
  isVercelConnected,
}: ProjectEditorWorkspaceProps) {
  const contentSchema = useMemo(
    () => (template ? getTemplateContentSchema(template.slug) : undefined),
    [template]
  )

  const designSchema = template
    ? getTemplateDesignSchema(template.slug)
    : undefined
  const [design, setDesign] = useState<unknown>(template?.initialDesign)
  const [savedDesign, setSavedDesign] = useState<unknown>(
    template?.initialDesign
  )
  const savedDesignRef = useRef<unknown>(template?.initialDesign)
  const [publishedDesign, setPublishedDesign] = useState<unknown>(
    initialPublishedDesign
  )

  const [content, setContent] = useState<unknown>(
    () => template?.initialContent
  )
  const [savedContent, setSavedContent] = useState<unknown>(
    () => template?.initialContent
  )
  // Read by the hide cleanup below, which only runs once.
  const savedContentRef = useRef<unknown>(template?.initialContent)
  const [publishedContent, setPublishedContent] = useState<unknown>(
    () => initialPublishedContent
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isFetchingStatus, setIsFetchingStatus] = useState(false)
  const statusCooldownUntilRef = useRef(0)
  const [deployment, setDeployment] =
    useState<DeploymentActionSnapshot>(initialDeployment)
  const [needsVercelReconnect, setNeedsVercelReconnect] =
    useState(!isVercelConnected)
  const deployingRef = useRef(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const [showFieldErrors, setShowFieldErrors] = useState(false)
  const [viewport, setViewport] = useState<PreviewViewport>("desktop")
  const [isSchemaFormOpen, setIsSchemaFormOpen] = useState(true)
  const router = useRouter()
  const isDirty = useMemo(
    () =>
      JSON.stringify([content, design]) !==
      JSON.stringify([savedContent, savedDesign]),
    [content, design, savedContent, savedDesign]
  )
  const isContentValid = useMemo(
    () =>
      !!contentSchema?.safeParse(content).success &&
      !!designSchema?.safeParse(design).success,
    [content, contentSchema, design, designSchema]
  )
  const contentErrors = useMemo(
    () =>
      showFieldErrors ? getSchemaErrors(contentSchema, content) : undefined,
    [content, contentSchema, showFieldErrors]
  )
  const designErrors = useMemo(
    () => (showFieldErrors ? getSchemaErrors(designSchema, design) : undefined),
    [design, designSchema, showFieldErrors]
  )
  const hasLiveDeployment =
    initialHasLiveDeployment ||
    (deployment.status === "ready" && !!deployment.liveUrl)
  const releaseOperation = hasLiveDeployment ? "publish" : "deploy"
  const hasUnpublishedChanges = useMemo(
    () =>
      JSON.stringify([savedContent, savedDesign]) !==
      JSON.stringify([publishedContent, publishedDesign]),
    [publishedContent, savedContent, publishedDesign, savedDesign]
  )
  const hasActiveDeployment = isActiveDeploymentStatus(deployment.status)
  const handleFetchStatus = useCallback(async () => {
    if (isFetchingStatus || Date.now() < statusCooldownUntilRef.current) return

    statusCooldownUntilRef.current = Date.now() + 60_000
    setIsFetchingStatus(true)
    try {
      const result = await fetchDeploymentStatusAction(projectId)
      if (result.status === "error") {
        toast.error(result.message)
        return
      }
      setDeployment((current) => ({
        ...result.deployment,
        inspectorUrl:
          result.deployment.inspectorUrl ?? current.inspectorUrl ?? null,
      }))
      console.log("Vercel deployment status", result.response)
    } finally {
      setIsFetchingStatus(false)
    }
  }, [isFetchingStatus, projectId])
  const releaseAction =
    releaseOperation === "publish" ? "publishing" : "deploying"

  const deployBlocker = useMemo((): DeployBlocker | undefined => {
    if (!template) {
      return {
        type: "tooltip",
        message: `Select a template for this project before ${releaseAction}.`,
      }
    }
    if (isSaving) {
      return {
        type: "tooltip",
        message: `Your draft is still saving. You can ${releaseOperation} once it finishes.`,
      }
    }
    if (hasActiveDeployment) {
      return {
        type: "tooltip",
        message:
          "A deployment is already in progress. Wait for it to finish before starting another.",
      }
    }
    if (!isContentValid) return { type: "invalid-content" }
    if (isDirty) {
      return {
        type: "tooltip",
        message: `You have unsaved changes. Save your draft before ${releaseAction} so your latest edits are included.`,
      }
    }
    if (releaseOperation === "publish" && !hasUnpublishedChanges) {
      return {
        type: "tooltip",
        message:
          "Your live site already matches your saved draft. Save new changes to publish again.",
      }
    }
    if (releaseOperation === "deploy" && needsVercelReconnect) {
      return { type: "vercel-reconnect" }
    }
    return undefined
  }, [
    hasActiveDeployment,
    hasUnpublishedChanges,
    isContentValid,
    isDirty,
    isSaving,
    needsVercelReconnect,
    releaseAction,
    releaseOperation,
    template,
  ])
  const deployDisabledReason =
    deployBlocker?.type === "tooltip" ? deployBlocker.message : undefined

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const result = await saveProjectDraftAction(projectId, content, design)
    setIsSaving(false)

    if (result.status === "success") {
      savedContentRef.current = content
      setSavedContent(content)
      savedDesignRef.current = design
      setSavedDesign(design)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }, [content, design, projectId])

  const handleDeploy = useCallback(async () => {
    if (deployingRef.current) return

    if (deployBlocker?.type === "invalid-content") {
      setShowFieldErrors(true)
      showInvalidFieldsToast(
        [
          ...getSchemaIssues(contentSchema, content).map((issue) => ({
            ...issue,
            section: "Content" as const,
          })),
          ...getSchemaIssues(designSchema, design).map((issue) => ({
            ...issue,
            section: "Design" as const,
          })),
        ],
        releaseAction
      )
      return
    }
    if (deployBlocker?.type === "vercel-reconnect") {
      showVercelReconnectToast()
      return
    }
    if (deployBlocker) return

    deployingRef.current = true

    const isPublishing = releaseOperation === "publish"
    const previousDeployment = deployment
    setIsDeploying(true)
    if (!isPublishing) {
      setDeployment((current) => ({
        ...current,
        status: "preparing",
        errorText: null,
      }))
    }

    try {
      const result = await deployProjectAction(projectId)
      const nextDeployment = result.deployment

      if (nextDeployment) {
        setDeployment((current) => ({
          ...nextDeployment,
          inspectorUrl:
            nextDeployment.inspectorUrl ?? current.inspectorUrl ?? null,
        }))
      } else {
        setDeployment(previousDeployment)
      }

      if (!isPublishing && result.code === "VERCEL_RECONNECT_REQUIRED") {
        setNeedsVercelReconnect(true)
      }

      if (result.status === "success") {
        setPublishedContent(savedContent)
        setPublishedDesign(savedDesign)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      setDeployment(previousDeployment)
      toast.error(
        isPublishing
          ? "Failed to publish changes."
          : "Failed to start the deployment."
      )
    } finally {
      deployingRef.current = false
      setIsDeploying(false)
    }
  }, [
    content,
    contentSchema,
    deployBlocker,
    deployment,
    design,
    designSchema,
    projectId,
    releaseAction,
    releaseOperation,
    savedContent,
    savedDesign,
  ])

  useEffect(() => {
    if (!isActiveDeploymentStatus(deployment.status)) return

    let cancelled = false
    const pollDeployment = async () => {
      try {
        const nextDeployment = await getProjectDeploymentAction(projectId)
        if (cancelled || !nextDeployment) return

        setDeployment((current) => ({
          ...nextDeployment,
          inspectorUrl:
            nextDeployment.inspectorUrl ?? current.inspectorUrl ?? null,
        }))
      } catch {
        // Keep the current status and retry on the next polling interval.
      }
    }

    const intervalId = window.setInterval(pollDeployment, 4000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [deployment.status, projectId])

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

  // Cache Components keeps this route mounted but hidden (<Activity>) after
  // navigating away; drop unsaved edits so the next visit starts from the
  // last saved content.
  useLayoutEffect(() => {
    return () => {
      setContent(savedContentRef.current)
      setDesign(savedDesignRef.current)
      setFormReady(false)
      setShowFieldErrors(false)
    }
  }, [])

  const handleFormReady = useCallback(() => {
    setFormReady(true)
  }, [])

  const updateViewport = (nextViewport: PreviewViewportPreset) => {
    setViewport(nextViewport)
  }

  const markViewportAsCustom = () => {
    setViewport("custom")
  }

  return (
    <section
      aria-label={`${projectName} editor workspace`}
      data-project-id={projectId}
      className="relative isolate min-h-[calc(100dvh-4.2rem)]"
    >
      <div aria-hidden="true" className="editor-workspace-grid" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.2rem)] w-full max-w-7xl flex-col gap-3 p-3">
        <EditorTopBar
          title={projectName}
          projectStatus={deployment.status}
          liveUrl={deployment.liveUrl}
          isDeploymentInProgress={hasActiveDeployment}
          onFetchStatus={handleFetchStatus}
          fetchStatusPending={isFetchingStatus}
          viewport={viewport}
          onViewportChange={updateViewport}
          isSchemaFormOpen={isSchemaFormOpen}
          onToggleSchemaForm={() => setIsSchemaFormOpen((current) => !current)}
        />

        <div
          className={cn(
            "flex w-full min-w-0 flex-1 items-start transition-[gap] duration-200 ease-out",
            isSchemaFormOpen ? "gap-3" : "gap-0"
          )}
        >
          <div className="min-h-[calc(100dvh-6rem)] min-w-0 flex-1 overflow-hidden">
            {template ? (
              <ResizableTemplatePreview
                slug={template.slug}
                name={template.name}
                content={content}
                design={design}
                formReady={formReady}
                viewport={viewport}
                isSchemaFormOpen={isSchemaFormOpen}
                onManualResize={markViewportAsCustom}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-card px-6 text-center text-sm text-muted-foreground">
                Select a template to start editing this project.
              </div>
            )}
          </div>

          <TemplateSchemaEditForm
            projectId={projectId}
            schema={contentSchema}
            designSchema={designSchema}
            designValue={design}
            contentErrors={contentErrors}
            designErrors={designErrors}
            onDesignChange={setDesign}
            value={content}
            onChange={setContent}
            onReady={handleFormReady}
            onSave={handleSave}
            onDeploy={handleDeploy}
            isDirty={isDirty}
            isSaving={isSaving}
            isDeploying={isDeploying}
            operation={releaseOperation}
            deployDisabledReason={deployDisabledReason}
            isOpen={isSchemaFormOpen}
          />
        </div>
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
