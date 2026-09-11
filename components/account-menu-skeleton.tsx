import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AccountMenuSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-secondary p-1",
        className
      )}
      aria-busy="true"
      aria-label="Loading account menu"
    >
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className="hidden h-3.5 w-20 bg-muted-foreground/10 lg:block" />
      <Skeleton className="mr-1 hidden size-3 rounded-full bg-muted-foreground/10 sm:block" />
    </div>
  )
}
