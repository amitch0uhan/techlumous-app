import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function IntegrationCardSkeleton() {
  return (
    <Card
      variant="integration"
      className="flex flex-col gap-5 rounded-3xl p-6 ring-0"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/5" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-8 w-2/5" />
      </div>

      <Separator />

      <Skeleton className="h-8 w-28 rounded-full" />
    </Card>
  )
}

export function IntegrationListSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading integrations"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <IntegrationCardSkeleton key={index} />
      ))}
    </div>
  )
}
