"use client"

import { Plus } from "@phosphor-icons/react"
import { useState } from "react"

import {
  CONTENT_CHILDREN,
  ICON_WEIGHT,
  join,
  pad,
  SECTION_RADIUS,
  trimmed,
  type PartialContent,
  type WhyItem,
} from "../lib"
import { emphasise } from "./emphasise"
import { Eyebrow } from "./eyebrow"

export function WhyUs({
  content,
  items,
  number,
}: {
  content: PartialContent
  items: WhyItem[]
  number: string
}) {
  // First row open by default; -1 means every row is collapsed.
  const [openRow, setOpenRow] = useState(0)

  return (
    <section
      data-reveal
      className={join(
        SECTION_RADIUS,
        CONTENT_CHILDREN,
        "lt-surface-section bg-lt-background py-[clamp(64px,8vw,140px)]"
      )}
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
        <Eyebrow index={number} label={content.whyEyebrow} />
        <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-foreground/60 m-0 max-w-[30ch] leading-[1.14] font-extralight text-pretty">
          {emphasise(content.whyHeadline)}
        </h2>
      </div>

      <div className="mt-[clamp(36px,5vw,72px)] flex flex-col">
        {items.map((item, index) => {
          const isOpen = index === openRow
          return (
            <div
              key={index}
              className={join(
                "border-lt-accordion-divider/[0.09] border-t",
                index === items.length - 1 && "border-b"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenRow(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-[clamp(16px,3vw,48px)] border-none bg-transparent py-[clamp(18px,2.2vw,28px)] text-left"
              >
                <span className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-accordion-number/60 flex-[0_0_44px] font-extralight">
                  {pad(index + 1)}
                </span>
                <span className="font-lt-display tracking-lt-snug text-lt-accordion-title flex-1 text-[clamp(24px,2.8vw,40px)] font-light">
                  {trimmed(item?.title)}
                </span>
                <span
                  aria-hidden="true"
                  className={join(
                    "border-lt-accordion-icon-border/35 text-lt-accordion-icon ease-lt-standard grid h-[34px] w-[34px] flex-[0_0_34px] place-items-center rounded-full border transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                >
                  <Plus size={15} weight={ICON_WEIGHT} />
                </span>
              </button>
              <div
                className={join(
                  "ease-lt-standard grid transition-[grid-template-rows,opacity] duration-300",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="text-lt-sm text-lt-accordion-body/[0.78] m-0 max-w-[62ch] pb-[clamp(20px,2.4vw,30px)] pl-[clamp(60px,6vw,92px)] leading-[1.75]">
                    {trimmed(item?.body)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
