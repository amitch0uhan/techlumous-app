import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TemplateCardSkeleton() {
  return (
    <Card
      variant="template"
      className="relative gap-2 rounded-3xl p-1.5"
      aria-hidden="true"
    >
      <div className="space-y-2 px-2 pt-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>

      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="absolute right-3 bottom-3 size-9 rounded-full" />
    </Card>
  )
}

export function TemplateListSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading templates"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <TemplateCardSkeleton key={index} />
      ))}
    </div>
  )
}
