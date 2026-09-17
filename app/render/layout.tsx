import { redirect } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { requireAuthenticatedUserId } from "@/lib/supabase/auth"

async function RenderGate({ children }: { children: ReactNode }) {
  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")

  return <>{children}</>
}

export default function RenderLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RenderGate>{children}</RenderGate>
    </Suspense>
  )
}
