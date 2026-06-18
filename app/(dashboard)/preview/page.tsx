import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")
  return (
    <div className="page">
      <h1>Preview</h1>
      <div className="flex items-center gap-3">
        <Logo size={56} />
        <span className="font-heading text-5xl tracking-tight text-primary">
          Techlumous
        </span>
      </div>
    </div>
  )
}
