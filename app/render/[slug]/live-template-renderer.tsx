"use client"

import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"

import {
  isTemplateLiveMessage,
  TEMPLATE_LIVE_CHANNEL,
} from "@/components/template-live-protocol"
import { getTemplate } from "@/templates/registry"

interface LiveTemplateRendererProps {
  slug: string
  initialContent: unknown
  initialDesign: unknown
}

export function LiveTemplateRenderer({
  slug,
  initialContent,
  initialDesign,
}: LiveTemplateRendererProps) {
  const template = getTemplate(slug)
  const [snapshot, setSnapshot] = useState({
    content: initialContent,
    design: initialDesign,
  })
  const rendererReadyRef = useRef(false)
  const formReadyRef = useRef(false)

  useEffect(() => {
    const parent = window.parent
    if (parent === window) return

    const sendRendererReady = () => {
      parent.postMessage(
        {
          channel: TEMPLATE_LIVE_CHANNEL,
          type: "renderer-ready",
          slug,
        },
        window.location.origin
      )
    }

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== parent ||
        !isTemplateLiveMessage(event.data) ||
        event.data.slug !== slug
      ) {
        return
      }

      if (event.data.type === "form-ready") {
        formReadyRef.current = true
        sendRendererReady()
        return
      }

      if (
        event.data.type === "snapshot-update" &&
        rendererReadyRef.current &&
        formReadyRef.current
      ) {
        const nextSnapshot = {
          content: event.data.content,
          design: event.data.design,
        }
        // Commit before acknowledging, so the parent only reveals the preview
        // once the template DOM holds the user's content and design.
        flushSync(() => setSnapshot(nextSnapshot))
        parent.postMessage(
          {
            channel: TEMPLATE_LIVE_CHANNEL,
            type: "snapshot-applied",
            slug,
          },
          window.location.origin
        )
      }
    }

    window.addEventListener("message", handleMessage)
    rendererReadyRef.current = true
    sendRendererReady()

    return () => {
      window.removeEventListener("message", handleMessage)
      rendererReadyRef.current = false
      formReadyRef.current = false
    }
  }, [slug])

  if (!template) return null

  const { Template } = template
  return <Template {...snapshot} />
}
