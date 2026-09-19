"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { selectTemplateAction } from "@/actions/project"
import { IconButton } from "@/components/ui/button"

export type PreviewProjectActionProps =
  | {
      type: "select"
      projectId: string
      templateId: string
      editHref: string
    }
  | { type: "edit"; href: string }

export function PreviewProjectAction(props: PreviewProjectActionProps) {
  if (props.type === "edit") {
    return (
      <IconButton
        render={<Link href={props.href} />}
        nativeButton={false}
        variant="outline"
        size="sm"
        className="shrink-0 rounded-full"
      >
        Edit template
      </IconButton>
    )
  }

  return <SelectAndEditButton {...props} />
}

function SelectAndEditButton({
  projectId,
  templateId,
  editHref,
}: {
  projectId: string
  templateId: string
  editHref: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSelect() {
    startTransition(async () => {
      const result = await selectTemplateAction(projectId, templateId)
      if (result.status === "success") {
        toast.success(result.message)
        router.push(editHref)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <IconButton
      type="button"
      onClick={handleSelect}
      disabled={isPending}
      aria-busy={isPending}
      variant="outline"
      size="sm"
      className="shrink-0 rounded-full"
    >
      {isPending ? "Navigating…" : "Select & Edit template"}
    </IconButton>
  )
}
