"use client"

import { useCallback, useEffect, useRef } from "react"

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

/**
 * Editor-oriented template preview that grows to fit its rendered document.
 */
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
        event.data.slug !== slug ||
        event.data.type !== "renderer-ready"
      ) {
        return
      }

      // The renderer re-announces itself every time it receives `form-ready`.
      // Answering a repeat announcement would post another `form-ready`, which
      // would trigger another announcement, and so on. Handshake once per
      // renderer document; `wireFrameHeight` clears this when a new one loads.
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

    // Measure from the editor's available viewport height so the frame never
    // collapses below the space the editor has given it.
    const minimumHeight = Math.max(window.innerHeight - 96, 320)

    // Templates set `min-height: 100vh` on their root, so a document that got
    // shorter still reports the full frame height and the preview could never
    // shrink back. Neutralise that with a stylesheet rather than by resizing
    // the frame: shrinking the frame changes the *renderer's* viewport, and
    // anything inside reacting to a viewport change — GSAP ScrollTrigger
    // refreshes and rewrites inline styles on its reveal targets — trips the
    // MutationObserver below, which measures again, which resizes again.
    // Toggling a stylesheet in <head> leaves the viewport alone, and the
    // observer only watches <body>, so the measurement stays invisible.
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

    // Writing an unchanged height still dirties layout, and every write is a
    // chance to feed a loop. Only touch the frame when the value moved.
    if (contentHeight === appliedHeightRef.current) return
    appliedHeightRef.current = contentHeight

    // A shrinking frame shortens the outer document. If the editor is scrolled
    // past the new height the browser clamps it, so restore the position.
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    frame.style.height = `${contentHeight}px`
    window.scrollTo(scrollX, scrollY)
  }, [])

  const wireFrameHeight = useCallback(
    (event: React.SyntheticEvent<HTMLIFrameElement>) => {
      cleanupRef.current?.()

      const frame = event.currentTarget
      frameLoadedRef.current = true
      // A load event means a fresh renderer document, so the previous
      // handshake no longer applies. Clearing this lets the new renderer's
      // `renderer-ready` through the guard in the message listener.
      rendererReadyRef.current = false
      const doc = frame.contentDocument

      sendFormReady()
      sendContentUpdate()

      if (!doc?.body) return

      doc.documentElement.style.overflow = "hidden"
      doc.body.style.overflow = "hidden"

      // Kept disabled except during a measurement. It lives in <head>, which
      // the MutationObserver below does not watch, so toggling it never looks
      // like a content change.
      const measureStyle = doc.createElement("style")
      measureStyle.textContent =
        "html,body{min-height:0!important}body>*{min-height:0!important}"
      measureStyle.disabled = true
      doc.head.appendChild(measureStyle)
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

      // Resizing an editor panel changes the iframe viewport without changing
      // the outer window. Re-measure after width-driven template reflow.
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

  useEffect(() => {
    return () => cleanupRef.current?.()
  }, [])

  return (
    <TemplateRenderer
      ref={iframeRef}
      slug={slug}
      name={name}
      title={`${name} live preview`}
      scrolling="no"
      onLoad={wireFrameHeight}
      className={cn(
        "block min-h-[calc(100dvh-6rem)] w-full border-0 bg-white",
        className
      )}
    />
  )
}
