import { TemplateCard } from "@/components/template-card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const STATIC_IMAGES = [
  "/assets/static-test/template-1.jpg",
  "/assets/static-test/template-2.jpg",
]

const templates = [
  { title: "Aurora Portfolio", type: "Portfolio" },
  { title: "Nimbus Store", type: "E-commerce" },
  { title: "Pulse Landing", type: "Landing" },
  { title: "Ledger Blog", type: "Blog" },
  { title: "Aurora Portfolio", type: "Portfolio" },
  { title: "Nimbus Store", type: "E-commerce" },
  { title: "Pulse Landing", type: "Landing" },
  { title: "Ledger Blog", type: "Blog" },
  { title: "Aurora Portfolio", type: "Portfolio" },
  { title: "Nimbus Store", type: "E-commerce" },
  { title: "Pulse Landing", type: "Landing" },
  { title: "Ledger Blog", type: "Blog" },
  { title: "Aurora Portfolio", type: "Portfolio" },
  { title: "Nimbus Store", type: "E-commerce" },
  { title: "Pulse Landing", type: "Landing" },
  { title: "Ledger Blog", type: "Blog" },
]

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <div className="page">
      <h1>Templates</h1>
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <TemplateCard
              key={`${template.title}-${index}`}
              image={STATIC_IMAGES[index % STATIC_IMAGES.length]}
              {...template}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
