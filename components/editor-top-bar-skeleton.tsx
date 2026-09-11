import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "./ui/card"

export function EditorTopBarSkeleton({ className }: { className?: string }) {
  return (
    <Card
      role="banner"
      className="relative flex min-h-12 w-full flex-row items-center justify-between gap-3 rounded-2xl bg-background px-4 py-0"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="h-3 w-28" />
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 gap-1 sm:flex">
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
      </div>
    </Card>
  )
}
