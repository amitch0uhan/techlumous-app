import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl p-0 sm:p-4 lg:p-6">{children}</main>
    </div>
  )
}
