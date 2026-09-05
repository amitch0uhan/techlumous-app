import { z } from "zod"

const text = (label: string) => z.string().meta({ label })

export const contentSchema = z.object({
  title: text("Title"),
})

export type LumousTravelOneContent = z.infer<typeof contentSchema>

export const defaultContent: LumousTravelOneContent = {
  title: "Lumous Travel One",
}
