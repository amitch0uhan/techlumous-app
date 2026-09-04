import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { requireAuthenticatedUserId } from "@/lib/supabase/auth"

export default async function RenderLayout({
  children,
}: {
  children: ReactNode
}) {
  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")

  return <>{children}</>
}
