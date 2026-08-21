import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
  return (
    <Card className="relative flex-col items-stretch gap-4 rounded-3xl p-1.5 ring-0! lg:flex-row lg:items-center lg:gap-6">
      <Skeleton className="aspect-video w-full shrink-0 rounded-2xl lg:w-64 lg:basis-1/3" />

      <div className="flex flex-1 flex-col gap-6 p-2 lg:p-0">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-3 sm:pr-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-23 rounded-full" />
        </div>
      </div>
    </Card>
  )
}

export function ProjectListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  )
}
