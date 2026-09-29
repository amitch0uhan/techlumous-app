import type { ZodType } from "zod"

import {
  contentSchema as lumousStudioOneSchema,
  designSchema as lumousStudioOneDesignSchema,
} from "./lumous-studio-one/schema"
import {
  contentSchema as lumousTravelOneSchema,
  designSchema as lumousTravelOneDesignSchema,
} from "./lumous-travel-one/schema"

const templateContentSchemas: Record<string, ZodType> = {
  "lumous-studio-one": lumousStudioOneSchema,
  "lumous-travel-one": lumousTravelOneSchema,
}

export function getTemplateContentSchema(slug: string): ZodType | undefined {
  return templateContentSchemas[slug]
}

const templateDesignSchemas: Record<string, ZodType> = {
  "lumous-studio-one": lumousStudioOneDesignSchema,
  "lumous-travel-one": lumousTravelOneDesignSchema,
}

export const getTemplateDesignSchema = (slug: string) =>
  templateDesignSchemas[slug]
