import { z } from "zod"

export const text = (label: string) => z.string().meta({ label })

export const area = (label: string) =>
  z.string().meta({ label, widget: "textarea", labelLayout: "above" })

export const link = (label: string) => z.string().meta({ label, format: "url" })

export const image = (label: string) =>
  z.string().meta({ label, widget: "image", labelLayout: "above" })

export const visibility = (label: string) =>
  z.boolean().meta({ label, widget: "switch" })

export const color = (label: string, fallback: string) =>
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour, e.g. #3AAE7E")
    .meta({ label, widget: "color" })
    .default(fallback)
