"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function signOut(): Promise<{
  error: string
  status?: "success" | "error"
} | void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { status: "error", error: error.message }
    }
  } catch (error) {
    return { status: "error", error: "Something went wrong during sign-out." }
  }

  revalidatePath("/", "layout")
  return { status: "success", error: "" }
}
