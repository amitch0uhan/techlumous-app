import { cn } from "@/lib/utils"
import { Card } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      variant="default"
      className={cn(
        "w-full max-w-md flex-row items-stretch gap-4 rounded-4xl bg-background p-2 ring-foreground/5!",
        className
      )}
    >
      <Skeleton className="aspect-video min-w-1/2 shrink-0 rounded-2xl" />

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-4 w-2/5 bg-muted-foreground/10"
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-6 w-1/3 rounded-full" />
          <Skeleton className="h-6 w-1/3 rounded-full bg-muted-foreground/10" />
        </div>
      </div>
    </Card>
  )
}
