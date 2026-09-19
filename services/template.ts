import "server-only"

import { cacheLife } from "next/cache"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import type { Template } from "./template.schema"

const TABLE = "templates"

// Reads run as the authenticated user (templates RLS: SELECT for `authenticated`).
// Writes are service_role only, so this fetching service exposes reads exclusively.

export async function listTemplates(): Promise<Template[]> {
  "use cache"
  cacheLife({
    stale: 600, // 10 min until considered stale
    revalidate: 3600, // 1 hours until revalidated
    expire: 21600, // 6 hours until expired
  })

  // This shared list must not read request cookies inside the cached scope.
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to list templates: ${error.message}`)

  return data
}

export async function getTemplate(slug: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw new Error(`Failed to get template: ${error.message}`)

  return data
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Failed to get template by id: ${error.message}`)

  return data
}
