import { ErrorState } from "@/components/error-state"

export default function DashboardNotFound() {
  return (
    <ErrorState
      code="404"
      message="The page you are looking for does not exist or may have been moved."
      actionHref="/"
      actionLabel="Back to home"
    />
  )
}
