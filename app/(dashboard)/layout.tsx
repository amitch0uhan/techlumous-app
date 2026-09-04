import { Header } from "@/components/header"
import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await requireAuthenticatedUserId()
  if (!userId) redirect("/login")

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl p-0 sm:p-4 lg:p-6">{children}</main>
    </div>
  )
}
