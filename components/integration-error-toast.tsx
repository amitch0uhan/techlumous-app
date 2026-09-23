"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state:
    "Your Vercel connection request expired or couldn't be verified. Please try connecting again.",
  missing_code:
    "Vercel didn't complete the authorization. Please try connecting again.",
  token_exchange_failed:
    "We couldn't complete the connection with Vercel. Please try again.",
  persist_failed:
    "Something went wrong while saving your Vercel connection. Please try again.",
}

const FALLBACK_MESSAGE = "Something went wrong while connecting to Vercel."

export function IntegrationErrorToast() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const error = searchParams.get("error")

  useEffect(() => {
    if (!error) return

    // A fixed id keeps a double-run effect from stacking two toasts.
    toast.error(ERROR_MESSAGES[error] ?? FALLBACK_MESSAGE, {
      id: "integration-error",
    })
    // Drop the param so a refresh doesn't show the toast again.
    router.replace(pathname, { scroll: false })
  }, [error, pathname, router])

  return null
}
