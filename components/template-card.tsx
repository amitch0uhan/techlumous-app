import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TemplateCardProps {
  title: string
  image: string
  type: string
  className?: string
}

export function TemplateCard({
  title,
  image,
  type,
  className,
}: TemplateCardProps) {
  return (
    <Card
      variant="template"
      className={cn(
        "group relative gap-2 rounded-3xl p-1.5 hover:shadow-card-foreground/65",
        className
      )}
    >
      <div className="px-2 pt-2">
        <CardTitle className="text-[22px] leading-5">{title}</CardTitle>
        <span className="font-mono text-xs font-light text-card-foreground/40">
          {type}
        </span>
      </div>

      <div className="aspect-video overflow-hidden rounded-2xl">
        <img
          src={image}
          alt={title}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-105"
        />
      </div>

      <Button
        variant="secondary"
        aria-label={`Open ${title}`}
        className="group-hover: absolute right-3 bottom-3 rounded-full bg-card py-4 backdrop-blur"
      >
        <span className="hidden pl-1 font-mono group-hover:inline">
          Preview
        </span>
        <ArrowUpRightIcon className="size-4 transition-all group-hover:rotate-45" />
      </Button>
    </Card>
  )
}
