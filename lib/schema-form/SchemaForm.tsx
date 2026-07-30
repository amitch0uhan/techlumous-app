"use client"

import * as React from "react"
import type { ZodType } from "zod"
import { PlusIcon, TrashSimpleIcon } from "@phosphor-icons/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { normalize } from "./normalize"
import { resolveWidget } from "./resolver"
import type { FieldDescriptor } from "./types"
import { widgets } from "./widgets"

function blankValue(field: FieldDescriptor): unknown {
  switch (field.kind) {
    case "object": {
      const obj: Record<string, unknown> = {}
      field.fields?.forEach((child) => {
        obj[child.key] = blankValue(child)
      })
      return obj
    }
    case "array":
      return []
    case "enum":
      return field.options?.[0] ?? ""
    case "number":
      return 0
    case "boolean":
      return false
    default:
      return ""
  }
}

interface FieldProps {
  field: FieldDescriptor
  value: unknown
  onChange: (next: unknown) => void
  layout?: SchemaFieldLayout
  className?: string
}

export type SchemaFieldLayout = "above" | "beside"

export function Field({
  field,
  value,
  onChange,
  layout = "above",
  className = "",
}: FieldProps) {
  const widget = resolveWidget(field)

  if (widget === "group") {
    const obj = (value ?? {}) as Record<string, unknown>
    const fields = (
      <>
        {field.fields?.map((child) => (
          <Field
            key={child.key}
            field={child}
            value={obj[child.key]}
            onChange={(next) => onChange({ ...obj, [child.key]: next })}
            layout={layout}
          />
        ))}
      </>
    )

    if (!field.label) {
      return <div className="flex flex-col">{fields}</div>
    }

    return (
      <Accordion variant="schema" defaultValue={[field.key]}>
        <AccordionItem variant="schema" value={field.key}>
          <AccordionTrigger className="px-3" variant="schema">
            {field.label}
          </AccordionTrigger>
          <AccordionContent variant="schema">{fields}</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  if (widget === "array") {
    const arr = (value ?? []) as unknown[]
    const item = field.item
    const label = field.label ?? "Items"

    return (
      <Accordion variant="schema" defaultValue={[field.key]}>
        <AccordionItem variant="schema" value={field.key}>
          <AccordionTrigger
            variant="schema"
            className="px-3"
            action={
              item ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Add ${label} item`}
                  onClick={() => onChange([...arr, blankValue(item)])}
                  className="rounded-none text-muted-foreground hover:text-foreground"
                >
                  <PlusIcon />
                </Button>
              ) : null
            }
          >
            <span className="flex-1">{label}</span>
          </AccordionTrigger>
          <AccordionContent variant="schema">
            <div className="flex flex-col">
              {arr.map((entry, index) => (
                <div
                  key={index}
                  className="relative border-t border-border/40 first:border-t-0"
                >
                  <div className="pr-6">
                    {item && (
                      <Field
                        field={item}
                        value={entry}
                        onChange={(next) =>
                          onChange(
                            arr.map((it, i) => (i === index ? next : it))
                          )
                        }
                        layout={layout}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove item"
                    onClick={() => onChange(arr.filter((_, i) => i !== index))}
                    className="absolute top-0 right-0 rounded-none text-foreground/40! hover:bg-destructive/5! hover:text-destructive!"
                  >
                    <TrashSimpleIcon />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  const Widget = widgets[widget] ?? widgets.text
  return (
    <div
      className={cn(
        "px-3 py-1",
        className,
        layout === "above"
          ? "space-y-1"
          : "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2"
      )}
    >
      {field.label && (
        <Label
          className={cn(
            "pl-1 font-mono text-xs text-muted-foreground",
            layout === "beside" && "self-start pt-1.5"
          )}
        >
          {field.label}
        </Label>
      )}
      <Widget field={field} value={value} onChange={onChange} />
    </div>
  )
}

export function SchemaForm({
  schema,
  value,
  onChange,
  layout = "beside",
}: {
  schema: ZodType
  value: unknown
  onChange: (next: unknown) => void
  layout?: SchemaFieldLayout
}) {
  const root = React.useMemo(() => normalize(schema), [schema])
  return (
    <Field field={root} value={value} onChange={onChange} layout={layout} />
  )
}
