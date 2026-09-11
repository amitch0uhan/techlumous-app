"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"

import { PreviewTemplateSkeleton } from "@/components/preview-skeleton"
import { TemplateRenderer } from "@/components/template-preview"
import {
  isTemplateLiveMessage,
  TEMPLATE_LIVE_CHANNEL,
  type TemplateLiveMessage,
} from "@/components/template-live-protocol"
import { cn } from "@/lib/utils"

interface TemplateAutoHeightPreviewProps {
  slug: string
  name: string
  content: unknown
  formReady: boolean
  className?: string
}

export function TemplateAutoHeightPreview({
  slug,
  name,
  content,
  formReady,
  className,
}: TemplateAutoHeightPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const frameLoadedRef = useRef(false)
  const rendererReadyRef = useRef(false)
  const measureStyleRef = useRef<HTMLStyleElement | null>(null)
  const appliedHeightRef = useRef(-1)
  const hasMountedRef = useRef(false)
  // Until the renderer confirms the user's content, it still shows defaults.
  const [isContentApplied, setIsContentApplied] = useState(false)

  const postToRenderer = useCallback((message: TemplateLiveMessage) => {
    const frame = iframeRef.current
    if (!frame?.contentWindow) return

    frame.contentWindow.postMessage(message, window.location.origin)
  }, [])

  const sendFormReady = useCallback(() => {
    if (!formReady || !frameLoadedRef.current) return

    postToRenderer({
      channel: TEMPLATE_LIVE_CHANNEL,
      type: "form-ready",
      slug,
    })
  }, [formReady, postToRenderer, slug])

  const sendContentUpdate = useCallback(() => {
    if (!formReady || !rendererReadyRef.current || !frameLoadedRef.current) {
      return
    }

    postToRenderer({
      channel: TEMPLATE_LIVE_CHANNEL,
      type: "content-update",
      slug,
      content,
    })
  }, [content, formReady, postToRenderer, slug])

  useEffect(() => {
    frameLoadedRef.current = false
    rendererReadyRef.current = false
  }, [slug])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const frame = iframeRef.current
      if (
        event.origin !== window.location.origin ||
        event.source !== frame?.contentWindow ||
        !isTemplateLiveMessage(event.data) ||
        event.data.slug !== slug
      ) {
        return
      }

      if (event.data.type === "content-applied") {
        setIsContentApplied(true)
        return
      }

      if (event.data.type !== "renderer-ready") return

      // Handshake once per renderer document, else form-ready/renderer-ready loop forever.
      if (rendererReadyRef.current) return

      rendererReadyRef.current = true
      sendFormReady()
      sendContentUpdate()
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [sendContentUpdate, sendFormReady, slug])

  useEffect(() => {
    if (!formReady) return
    sendFormReady()
    sendContentUpdate()
  }, [formReady, sendContentUpdate, sendFormReady])

  useEffect(() => {
    sendContentUpdate()
  }, [content, sendContentUpdate])

  const resizeFrame = useCallback(() => {
    const frame = iframeRef.current
    const doc = frame?.contentDocument
    if (!frame || !doc?.body) return

    const minimumHeight = Math.max(window.innerHeight - 96, 320)

    // Suppress the templates' `min-height: 100vh` for the measurement so the frame
    // can shrink. A <head> stylesheet does this without touching the renderer
    // viewport, which would trip the body MutationObserver and feed a resize loop.
    const measureStyle = measureStyleRef.current
    if (measureStyle) measureStyle.disabled = false

    const contentHeight = Math.max(
      doc.documentElement.scrollHeight,
      doc.documentElement.offsetHeight,
      doc.body.scrollHeight,
      doc.body.offsetHeight,
      minimumHeight
    )

    if (measureStyle) measureStyle.disabled = true

    // Only touch the frame when the value moved; an unchanged write still risks a loop.
    if (contentHeight === appliedHeightRef.current) return
    appliedHeightRef.current = contentHeight

    // A shorter frame can clamp the outer scroll position; restore it.
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    frame.style.height = `${contentHeight}px`
    window.scrollTo(scrollX, scrollY)
  }, [])

  const wireFrameHeight = useCallback(
    (frame: HTMLIFrameElement) => {
      cleanupRef.current?.()

      frameLoadedRef.current = true
      // Fresh renderer document: let its `renderer-ready` back through the guard.
      rendererReadyRef.current = false
      const doc = frame.contentDocument

      sendFormReady()
      sendContentUpdate()

      if (!doc?.body) return

      doc.documentElement.style.overflow = "hidden"
      doc.body.style.overflow = "hidden"

      // Lives in <head> (unwatched by the observer); enabled only during a measurement.
      const measureStyle = doc.createElement("style")
      measureStyle.textContent =
        "html,body{min-height:0!important}body>*{min-height:0!important}"
      doc.head.appendChild(measureStyle)
      measureStyle.disabled = true
      measureStyleRef.current = measureStyle
      appliedHeightRef.current = -1

      let disposed = false
      let animationFrame: number | null = null
      let previousFrameWidth = frame.getBoundingClientRect().width
      const scheduleResize = () => {
        if (disposed || animationFrame !== null) return
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = null
          resizeFrame()
        })
      }

      const mutationObserver = new MutationObserver(scheduleResize)
      mutationObserver.observe(doc.body, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      })

      // Re-measure after a width-driven template reflow (editor panel resize).
      const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry || entry.contentRect.width === previousFrameWidth) return
        previousFrameWidth = entry.contentRect.width
        scheduleResize()
      })
      resizeObserver.observe(frame)

      doc.addEventListener("load", scheduleResize, true)
      doc.addEventListener("transitionend", scheduleResize, true)
      window.addEventListener("resize", scheduleResize)
      void doc.fonts.ready.then(scheduleResize)

      resizeFrame()

      cleanupRef.current = () => {
        disposed = true
        mutationObserver.disconnect()
        resizeObserver.disconnect()
        doc.removeEventListener("load", scheduleResize, true)
        doc.removeEventListener("transitionend", scheduleResize, true)
        window.removeEventListener("resize", scheduleResize)
        measureStyle.remove()
        if (measureStyleRef.current === measureStyle) {
          measureStyleRef.current = null
        }
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame)
        }
      }
    },
    [resizeFrame, sendContentUpdate, sendFormReady]
  )

  const rewireOnReshow = useEffectEvent(() => {
    if (iframeRef.current) wireFrameHeight(iframeRef.current)
  })

  // On a hard reload the server-rendered iframe can finish loading before
  // hydration attaches `onLoad`, and React doesn't replay that missed event.
  const wireIfAlreadyLoaded = useEffectEvent(() => {
    const frame = iframeRef.current
    const doc = frame?.contentDocument
    if (!frame || doc?.readyState !== "complete" || doc.URL === "about:blank") {
      return
    }
    wireFrameHeight(frame)
  })

  // Cache Components hides this route with <Activity> instead of unmounting
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      wireIfAlreadyLoaded()
    } else {
      rewireOnReshow()
    }
    return () => cleanupRef.current?.()
  }, [])

  return (
    <div className="relative">
      <TemplateRenderer
        ref={iframeRef}
        slug={slug}
        name={name}
        title={`${name} live preview`}
        scrolling="no"
        onLoad={(event) => wireFrameHeight(event.currentTarget)}
        className={cn(
          "block min-h-[calc(100dvh-6rem)] w-full border-0 bg-transparent",
          // Hidden, not removed: the frame must keep loading and measuring.
          !isContentApplied && "invisible",
          className
        )}
      />
      {!isContentApplied && (
        <div className="absolute inset-0">
          <PreviewTemplateSkeleton />
        </div>
      )}
    </div>
  )
}
