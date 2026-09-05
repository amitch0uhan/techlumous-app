"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function DesktopRequiredToast() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("notice") !== "desktop-required") return

    toast.error("Editing requires a desktop device.")

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete("notice")
    const query = nextSearchParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }, [pathname, router, searchParams])

  return null
}
