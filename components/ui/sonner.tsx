"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

/**
 * Default icons for the three toast types. A call site can override one per
 * toast with `toast.error("...", { icon: <TrashIcon /> })`, or replace them
 * globally by passing an `icons` prop to this Toaster.
 */
const defaultIcons: ToasterProps["icons"] = {
  info: <InfoIcon weight="regular" />,
  success: <CheckCircleIcon weight="regular" />,
  error: <WarningCircleIcon weight="regular" />,
}

const Toaster = ({ icons, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-left"
      closeButton
      className="toaster group"
      icons={{ ...defaultIcons, ...icons }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
