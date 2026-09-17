"use client"

import { useEffect, useState } from "react"
import { z, type ZodType } from "zod"
import { CircleNotchIcon, ArrowCircleUpRightIcon } from "@phosphor-icons/react"

import { SchemaFormScrollArea } from "@/components/schema-form-scroll-area"
import { Button, IconButton } from "@/components/ui/button"
import { Card, CardFooter, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SchemaForm } from "@/lib/schema-form"
import { cn } from "@/lib/utils"

type Tab = "content" | "design" | "seo"
type TabList = {
  label: string
  value: Tab
}

const tabsList: TabList[] = [
  { label: "Content", value: "content" },
  { label: "Design", value: "design" },
  { label: "SEO", value: "seo" },
]

interface TemplateSchemaEditFormProps {
  projectId: string
  schema?: ZodType
  value?: unknown
  designSchema?: ZodType
  designValue?: unknown
  contentErrors?: Record<string, string>
  designErrors?: Record<string, string>
  onDesignChange: (next: unknown) => void
  onChange: (next: unknown) => void
  onReady?: () => void
  onSave: () => void
  onDeploy: () => void
  isDirty: boolean
  isSaving: boolean
  isDeploying: boolean
  operation: "deploy" | "publish"
  deployDisabledReason?: string
  isOpen: boolean
  className?: string
}

export function TemplateSchemaEditForm({
  projectId,
  schema,
  value,
  designSchema,
  designValue,
  contentErrors,
  designErrors,
  onDesignChange,
  onChange,
  onReady,
  onSave,
  onDeploy,
  isDirty,
  isSaving,
  isDeploying,
  operation,
  deployDisabledReason,
  isOpen,
  className,
}: TemplateSchemaEditFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>("content")

  useEffect(() => {
    if (schema && designSchema) onReady?.()
  }, [onReady, schema, designSchema])

  return (
    <Card
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "sticky top-17 flex h-[calc(100dvh-6rem)] min-h-0 shrink-0 flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 transition-[width,opacity,transform] duration-200 ease-out",
        isOpen
          ? "w-[clamp(14rem,28vw,22rem)] translate-x-0 opacity-100"
          : "pointer-events-none w-0 translate-x-2 opacity-0",
        className
      )}
    >
      <CardTitle className="p-3 text-base font-medium">Edit template</CardTitle>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Tab)}
        className="mb-2"
      >
        <TabsList className="h-9 w-full rounded-none bg-card/60 px-1 pb-0">
          {tabsList.map(({ label, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-t-lg rounded-b-none border-0 px-3 py-0 font-mono text-sm tab:px-4 data-active:bg-background data-active:text-card-foreground dark:data-active:bg-background"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SchemaFormScrollArea
        aria-label="Schema fields"
        className="min-h-0 flex-1 pt-2"
      >
        <div className="pt-1">
          {activeTab === "seo" ? (
            <p className="px-4 text-sm text-muted-foreground">
              SEO settings are coming soon.
            </p>
          ) : activeTab === "design" &&
            designSchema instanceof z.ZodObject &&
            Object.keys(designSchema.shape).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No design settings for this template
            </p>
          ) : schema && designSchema ? (
            <SchemaForm
              key={activeTab}
              schema={activeTab === "design" ? designSchema : schema}
              projectId={projectId}
              value={activeTab === "design" ? designValue : value}
              onChange={activeTab === "design" ? onDesignChange : onChange}
              errors={activeTab === "design" ? designErrors : contentErrors}
              layout="beside"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a template to edit its content.
            </p>
          )}
        </div>
      </SchemaFormScrollArea>

      <CardFooter className="flex-col items-stretch gap-2 border-t border-accent-foreground/20 p-3 pt-3!">
        <div className="flex justify-end gap-2">
          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="rounded-full px-3"
          >
            {isSaving ? "Saving..." : "Save draft"}
          </Button>
          <Tooltip disabled={!deployDisabledReason || isDeploying}>
            <TooltipTrigger
              render={
                <IconButton
                  type="button"
                  icon={isDeploying ? CircleNotchIcon : ArrowCircleUpRightIcon}
                  iconPosition="end"
                  iconClassName={cn(isDeploying && "animate-spin")}
                  // focusableWhenDisabled uses aria-disabled, keeping it hoverable.
                  className="rounded-full pl-3 aria-disabled:opacity-50"
                  onClick={onDeploy}
                  disabled={isDeploying || !!deployDisabledReason}
                  focusableWhenDisabled
                  aria-busy={isDeploying}
                />
              }
            >
              {isDeploying
                ? operation === "publish"
                  ? "Publishing..."
                  : "Deploying..."
                : operation === "publish"
                  ? "Publish changes"
                  : "Deploy"}
            </TooltipTrigger>
            <TooltipContent side="top" align="end">
              {deployDisabledReason}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  )
}
