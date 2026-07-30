import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
} from "@phosphor-icons/react"

type AccordionVariant = "default" | "schema"

function Accordion({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Root.Props & { variant?: AccordionVariant }) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md border",
        variant === "schema" &&
          "rounded-none border-x-0 border-t border-b-0 border-border/60 bg-background first:border-t-0",
        className
      )}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Item.Props & { variant?: AccordionVariant }) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      data-variant={variant}
      className={cn(
        "not-last:border-b data-open:bg-muted/50",
        variant === "schema" &&
          "border-0 bg-background data-open:bg-background",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  variant = "default",
  action,
  ...props
}: AccordionPrimitive.Trigger.Props & {
  variant?: AccordionVariant
  action?: React.ReactNode
}) {
  const triggerIcon =
    variant === "schema" ? (
      <>
        <CaretRightIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <CaretDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </>
    ) : (
      <>
        <CaretDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <CaretUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </>
    )

  return (
    <AccordionPrimitive.Header
      className={cn("flex", variant === "schema" && "items-center")}
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        data-variant={variant}
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-xs/relaxed font-medium transition-all outline-none hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          variant === "schema" &&
            "h-9 items-center justify-start gap-1.5 px-0 py-0 font-mono font-medium text-foreground/80 hover:bg-muted/30 hover:text-foreground hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0 **:data-[slot=accordion-trigger-icon]:size-3",
          className
        )}
        {...props}
      >
        {variant === "schema" && triggerIcon}
        {children}
        {variant === "default" && triggerIcon}
        {action}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  variant = "default",
  ...props
}: AccordionPrimitive.Panel.Props & { variant?: AccordionVariant }) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      data-variant={variant}
      className={cn(
        "overflow-hidden px-2 text-xs/relaxed data-open:animate-accordion-down data-closed:animate-accordion-up",
        variant === "schema" && "px-0"
      )}
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          variant === "schema" && "space-y-0 border-0 p-0",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
