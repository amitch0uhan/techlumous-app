"use server"

import { cacheLife } from "next/cache"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import type { Template } from "./template.schema"

const TABLE = "templates"

// Reads run as the authenticated user (templates RLS: SELECT for `authenticated`).
// Writes are service_role only, so this fetching service exposes reads exclusively.

export async function listTemplates(): Promise<Template[]> {
  "use cache"
  cacheLife({
    stale: 6 * 60 * 60,
    revalidate: 6 * 60 * 60,
    expire: 24 * 60 * 60,
  })

  // This shared list must not read request cookies inside the cached scope.
  const supabase = await createAdminClient()

  console.log("Fetching templates from Supabase")

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
