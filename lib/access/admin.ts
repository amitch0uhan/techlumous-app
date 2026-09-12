import "server-only"

import { createAdminClient } from "@/lib/supabase/server"
import { isUserType, type UserType } from "./user-types"

export async function setUserType(
  userId: string,
  type: UserType
): Promise<void> {
  if (!isUserType(type)) {
    throw new Error(`Failed to set user type: unknown type "${type}"`)
  }

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({ user_type: type })
    .eq("id", userId)
    .select("id")
    .maybeSingle()

  if (error) throw new Error(`Failed to set user type: ${error.message}`)
  if (!data)
    throw new Error(`Failed to set user type: no profile for ${userId}`)
}
