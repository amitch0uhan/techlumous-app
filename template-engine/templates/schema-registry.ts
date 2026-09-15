import type { ZodType } from "zod"

import {
  contentSchema as helloWorldSchema,
  designSchema as helloWorldDesignSchema,
} from "./hello-world/schema"
import {
  contentSchema as lumousMarkOneSchema,
  designSchema as lumousMarkOneDesignSchema,
} from "./lumous-mark-one/schema"
import {
  contentSchema as lumousTravelOneSchema,
  designSchema as lumousTravelOneDesignSchema,
} from "./lumous-travel-one/schema"

const templateContentSchemas: Record<string, ZodType> = {
  "hello-world": helloWorldSchema,
  "lumous-mark-one": lumousMarkOneSchema,
  "lumous-travel-one": lumousTravelOneSchema,
}

export function getTemplateContentSchema(slug: string): ZodType | undefined {
  return templateContentSchemas[slug]
}

const templateDesignSchemas: Record<string, ZodType> = {
  "hello-world": helloWorldDesignSchema,
  "lumous-mark-one": lumousMarkOneDesignSchema,
  "lumous-travel-one": lumousTravelOneDesignSchema,
}

export const getTemplateDesignSchema = (slug: string) =>
  templateDesignSchemas[slug]
