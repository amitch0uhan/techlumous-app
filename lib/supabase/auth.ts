import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export async function requireAuthenticatedUserId(
  supabase?: SupabaseClient
): Promise<string | null> {
  try {
    const client = supabase ?? (await createClient())
    const { data, error } = await client.auth.getClaims()
    const userId = data?.claims.sub

    if (error || !userId) {
      return null
    }

    return userId
  } catch {
    return null
  }
}
