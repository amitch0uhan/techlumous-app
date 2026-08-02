"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const SCROLLBAR_INSET = 4
const MIN_THUMB_HEIGHT = 24
const HIDE_DELAY = 700

interface ScrollMetrics {
  height: number
  top: number
  scrollable: boolean
}

function getScrollMetrics(viewport: HTMLDivElement): ScrollMetrics {
  const { clientHeight, scrollHeight, scrollTop } = viewport
  const trackHeight = Math.max(clientHeight - SCROLLBAR_INSET * 2, 0)

  if (scrollHeight <= clientHeight || trackHeight === 0) {
    return { height: 0, top: 0, scrollable: false }
  }

  const height = Math.min(
    Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT),
    trackHeight
  )
  const availableScroll = scrollHeight - clientHeight
  const availableTrack = trackHeight - height

  return {
    height,
    top: availableTrack * (scrollTop / availableScroll),
    scrollable: true,
  }
}

function SchemaFormScrollArea({
  children,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: React.ComponentProps<"div">) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const dragStartRef = React.useRef({ pointerY: 0, scrollTop: 0 })
  const [dragging, setDragging] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [metrics, setMetrics] = React.useState<ScrollMetrics>({
    height: 0,
    top: 0,
    scrollable: false,
  })

  const updateMetrics = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    setMetrics(getScrollMetrics(viewport))
  }, [])

  const scheduleHide = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, HIDE_DELAY)
  }, [])

  const showTemporarily = React.useCallback(() => {
    updateMetrics()
    setVisible(true)
    scheduleHide()
  }, [scheduleHide, updateMetrics])

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    updateMetrics()

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(viewport)
    resizeObserver.observe(content)

    return () => resizeObserver.disconnect()
  }, [updateMetrics])

  React.useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    },
    []
  )

  function handleThumbPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current
    if (!viewport) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = {
      pointerY: event.clientY,
      scrollTop: viewport.scrollTop,
    }
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setDragging(true)
    setVisible(true)
  }

  function handleThumbPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return

    const viewport = viewportRef.current
    if (!viewport) return

    const trackHeight = viewport.clientHeight - SCROLLBAR_INSET * 2
    const availableTrack = trackHeight - metrics.height
    const availableScroll = viewport.scrollHeight - viewport.clientHeight
    if (availableTrack <= 0 || availableScroll <= 0) return

    const pointerDelta = event.clientY - dragStartRef.current.pointerY
    viewport.scrollTop =
      dragStartRef.current.scrollTop +
      (pointerDelta / availableTrack) * availableScroll
  }

  function handleThumbPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
    scheduleHide()
  }

  return (
    <div className={cn("relative min-h-0", className)} {...props}>
      <div
        ref={viewportRef}
        role="region"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={0}
        onScroll={showTemporarily}
        className="no-scrollbar h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-inset"
      >
        <div ref={contentRef}>{children}</div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1 right-1 bottom-1 z-10 w-1 transition-opacity duration-200",
          metrics.scrollable && (visible || dragging)
            ? "opacity-100"
            : "opacity-0"
        )}
      >
        <div
          onPointerDown={handleThumbPointerDown}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUp}
          onPointerCancel={handleThumbPointerUp}
          className={cn(
            "pointer-events-auto absolute inset-x-0 rounded-full bg-foreground/35 transition-colors hover:bg-foreground/50",
            dragging && "bg-foreground/55"
          )}
          style={{
            height: metrics.height,
            transform: `translateY(${metrics.top}px)`,
          }}
        />
      </div>
    </div>
  )
}

export { SchemaFormScrollArea }
