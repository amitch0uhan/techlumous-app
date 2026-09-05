import type { ZodType } from "zod"

import { contentSchema as helloWorldSchema } from "./hello-world/schema"
import { contentSchema as lumousMarkOneSchema } from "./lumous-mark-one/schema"
import { contentSchema as lumousTravelOneSchema } from "./lumous-travel-one/schema"

const templateContentSchemas: Record<string, ZodType> = {
  "hello-world": helloWorldSchema,
  "lumous-mark-one": lumousMarkOneSchema,
  "lumous-travel-one": lumousTravelOneSchema,
}

export function getTemplateContentSchema(slug: string): ZodType | undefined {
  return templateContentSchemas[slug]
}
