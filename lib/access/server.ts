import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import {
  ACCESS,
  toUserType,
  type UserAccess,
  type UserType,
} from "./user-types"

export type CurrentUserAccess = {
  type: UserType
  limits: UserAccess
}

// The type lives in public.profiles (RLS: users can only read their own row).
// Reads cookies, so never call this inside a "use cache" scope.
export const getUserAccess = cache(
  async (supabase?: SupabaseClient): Promise<CurrentUserAccess | null> => {
    const client = supabase ?? (await createClient())

    const { data, error } = await client
      .from("profiles")
      .select("user_type")
      .maybeSingle()

    if (error) throw new Error(`Failed to get user access: ${error.message}`)

    const type = toUserType(data?.user_type)

    return { type, limits: ACCESS[type] }
  }
)
