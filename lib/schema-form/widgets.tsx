"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { CircleNotchIcon, ImageIcon, TrashIcon } from "@phosphor-icons/react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { uploadImage } from "@/services/image"

import type { WidgetId, WidgetProps } from "./types"

type LeafWidget = Exclude<WidgetId, "group" | "array">

function TextWidget({ value, onChange, field }: WidgetProps) {
  return (
    <Input
      variant="schema"
      value={String(value ?? "")}
      placeholder={field.label}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function TextareaWidget({ value, onChange, field }: WidgetProps) {
  return (
    <Textarea
      variant="schema"
      value={String(value ?? "")}
      placeholder={field.label}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function UrlWidget({ value, onChange, field }: WidgetProps) {
  return (
    <Input
      variant="schema"
      type="url"
      value={String(value ?? "")}
      placeholder={field.label}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function imageName(url: string) {
  if (!url) return "Upload image"

  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "Image")
  } catch {
    return "Image"
  }
}

function ImageWidget({ value, onChange, field }: WidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imageUrl = String(value ?? "")
  const [previewUrl, setPreviewUrl] = useState(imageUrl)
  const [fileName, setFileName] = useState(() => imageName(imageUrl))
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [fileType, setFileType] = useState("")
  const [state, setState] = useState<"idle" | "uploading" | "error" | "done">(
    imageUrl ? "done" : "idle"
  )
  const [error, setError] = useState("")

  async function handleFile(file: File) {
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setFileName(file.name)
    setFileSize(file.size)
    setFileType(file.type)
    setError("")
    setState("uploading")

    try {
      const url = await uploadImage(file)
      onChange(url)
      setPreviewUrl(url)
      setState("done")
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed"
      )
      setState("error")
    } finally {
      URL.revokeObjectURL(localPreview)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const hasImage = Boolean(previewUrl)
  const description =
    state === "uploading"
      ? `Uploading · ${fileSize ? formatFileSize(fileSize) : ""}`
      : state === "error"
        ? error
        : fileSize
          ? `${fileType.replace("image/", "").toUpperCase()} · ${formatFileSize(fileSize)}`
          : hasImage
            ? "Stored image"
            : "PNG, JPG, WebP or AVIF"

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        disabled={state === "uploading"}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
      <Attachment
        state={state}
        className="w-full flex-nowrap rounded-md border-border bg-card text-secondary-foreground dark:bg-input/30"
      >
        <AttachmentMedia
          variant={hasImage ? "image" : "icon"}
          className="aspect-video! w-20! bg-input/40 text-muted-foreground dark:bg-background/30"
        >
          {hasImage ? (
            <Image
              src={previewUrl}
              alt={field.label ?? fileName}
              width={80}
              height={45}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="font-normal text-secondary-foreground">
            {fileName}
          </AttachmentTitle>
          <AttachmentDescription>{description}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions className="pr-2">
          {state === "uploading" ? (
            <CircleNotchIcon className="size-4 animate-spin" />
          ) : (
            hasImage && (
              <AttachmentAction
                type="button"
                aria-label={`Remove ${fileName}`}
                onClick={() => {
                  onChange("")
                  setPreviewUrl("")
                  setFileName("Upload image")
                  setFileSize(null)
                  setFileType("")
                  setError("")
                  setState("idle")
                }}
              >
                <TrashIcon />
              </AttachmentAction>
            )
          )}
        </AttachmentActions>
        <AttachmentTrigger
          aria-label={`${hasImage ? "Replace" : "Upload"} ${field.label ?? "image"}`}
          disabled={state === "uploading"}
          onClick={() => inputRef.current?.click()}
        />
      </Attachment>
    </>
  )
}

function SelectWidget({ value, onChange, field }: WidgetProps) {
  return (
    <Select
      value={String(value ?? "")}
      onValueChange={(next) => onChange(next)}
    >
      <SelectTrigger variant="schema" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const widgets: Record<
  LeafWidget,
  (props: WidgetProps) => React.ReactNode
> = {
  text: TextWidget,
  textarea: TextareaWidget,
  url: UrlWidget,
  image: ImageWidget,
  select: SelectWidget,
}
