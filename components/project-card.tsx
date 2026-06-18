import { TrashIcon } from "@phosphor-icons/react/ssr"

import { ArrowButton, Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ProjectStatus = "live" | "building" | "offline"

interface ProjectCardProps {
  name: string
  url: string
  image: string
  status?: ProjectStatus
  createdAt: string
  websiteUrl: string
  vercelUrl: string
  onDelete?: () => void
  className?: string
}

const STATUS: Record<ProjectStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-green-500" },
  building: { label: "Building", dot: "bg-amber-500" },
  offline: { label: "Offline", dot: "bg-destructive" },
}

function InfoItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0">
      <span className="font-mono text-sm text-muted-foreground">{label}</span>
      <div className="font-heading text-2xl text-foreground">{children}</div>
    </div>
  )
}

export function ProjectCard({
  name,
  url,
  image,
  status = "live",
  createdAt,
  websiteUrl,
  vercelUrl,
  onDelete,
  className,
}: ProjectCardProps) {
  const statusConfig = STATUS[status]

  return (
    <Card
      variant="default"
      className={cn(
        "relative flex-col items-stretch gap-4 rounded-3xl p-1.5 ring-0! lg:flex-row lg:items-center lg:gap-6",
        className
      )}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl lg:w-64 lg:basis-1/3">
        <img src={image} alt={name} className="size-full object-cover" />

        <Button
          variant="destructive"
          size="icon"
          aria-label={`Delete ${name}`}
          onClick={onDelete}
          className="absolute top-3 right-3 rounded-full lg:hidden"
        >
          <TrashIcon />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-2 lg:p-0">
        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <InfoItem label="Project Name">{name}</InfoItem>
          <InfoItem label="Status">
            <span className="inline-flex items-center gap-2">
              <span className={cn("size-1.5 rounded-full", statusConfig.dot)} />
              {statusConfig.label}
            </span>
          </InfoItem>
          <InfoItem label="Project URL">{url}</InfoItem>
          <InfoItem label="Created">{createdAt}</InfoItem>
        </div>

        <div className="flex gap-3">
          <ArrowButton
            render={
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" />
            }
            variant="default"
            badgeClassName="bg-primary-foreground text-black"
          >
            Visit Website
          </ArrowButton>
          <ArrowButton
            render={
              <a href={vercelUrl} target="_blank" rel="noopener noreferrer" />
            }
            variant="ghost"
          >
            Vercel Project
          </ArrowButton>
        </div>
      </div>

      <Button
        variant="destructive"
        size="icon"
        aria-label={`Delete ${name}`}
        onClick={onDelete}
        className="absolute top-4 right-4 hidden rounded-full lg:flex"
      >
        <TrashIcon />
      </Button>
    </Card>
  )
}
