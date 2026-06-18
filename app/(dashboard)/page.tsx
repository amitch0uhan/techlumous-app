import { ProjectCard } from "@/components/project-card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const STATIC_IMAGES = [
  "/assets/static-test/template-1.jpg",
  "/assets/static-test/template-2.jpg",
]

const projects = [
  {
    name: "Techlumous Landing Page",
    url: "techlumous.com",
    status: "live" as const,
    createdAt: "05th April, 26",
    websiteUrl: "https://techlumous.com",
    vercelUrl: "https://vercel.com",
  },
  {
    name: "Nimbus Store",
    url: "nimbus.store",
    status: "building" as const,
    createdAt: "18th March, 26",
    websiteUrl: "https://nimbus.store",
    vercelUrl: "https://vercel.com",
  },
  {
    name: "Pulse Analytics",
    url: "pulse.app",
    status: "offline" as const,
    createdAt: "27th February, 26",
    websiteUrl: "https://pulse.app",
    vercelUrl: "https://vercel.com",
  },
]

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <div className="page">
      <h1 className="max-sm:pl-2">Projects</h1>
      <div className="flex flex-col gap-4">
        {projects.map((project, index) => (
          <ProjectCard
            key={`${project.name}-${index}`}
            image={STATIC_IMAGES[index % STATIC_IMAGES.length]}
            {...project}
          />
        ))}
      </div>
    </div>
  )
}
