"use client"

import { Minus, Plus } from "@phosphor-icons/react"
import { useId, useState } from "react"

import {
  COLUMN,
  H2_LARGE,
  ICON_WEIGHT,
  join,
  record,
  SECTION_Y,
  trimmed,
  type Content,
  type FaqItem,
} from "../lib"
import { Words } from "./words"

export function Faq({ faq, items }: { faq: unknown; items: FaqItem[] }) {
  const f = record<Content["faq"]>(faq)
  const id = useId()
  // Rows open independently; a stale index after a removal simply matches nothing.
  const [open, setOpen] = useState<number[]>([])
  const toggle = (index: number) =>
    setOpen((current) =>
      current.includes(index)
        ? current.filter((entry) => entry !== index)
        : [...current, index]
    )

  return (
    <section id="faq" className={join(COLUMN, SECTION_Y, "scroll-mt-20")}>
      <div className="flex flex-wrap items-start gap-[clamp(32px,6vw,120px)]">
        <div
          data-reveal
          className="ls-wide:sticky ls-wide:top-[clamp(40px,12vh,120px)] flex-[1_1_280px]"
        >
          <h2 data-heading-words className={H2_LARGE}>
            <Words text={trimmed(f.heading)} />
          </h2>
          <p className="text-ls-foreground mt-[clamp(20px,2vw,28px)] mb-0 max-w-[24em] text-[clamp(16px,1.2vw,19px)] leading-[1.65] text-pretty">
            {trimmed(f.body)}
          </p>
        </div>

        <div className="grid min-w-0 flex-[1.9_1_480px]">
          {items.map((item, index) => {
            const isOpen = open.includes(index)
            const questionId = `${id}-q${index}`
            const answerId = `${id}-a${index}`
            return (
              <div
                key={index}
                className="border-ls-accordion-divider/90 border-t-2"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggle(index)}
                    className="font-ls-display text-ls-accordion-question flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent py-[clamp(36px,3.6vw,56px)] text-left text-[clamp(22px,1.7vw,30px)] font-medium"
                  >
                    <span>{trimmed(item?.question)}</span>
                    <span
                      aria-hidden="true"
                      className="border-ls-accordion-icon-border/[0.28] text-ls-accordion-icon grid size-10 flex-none place-items-center rounded-full border"
                    >
                      {isOpen ? (
                        <Minus size={18} weight={ICON_WEIGHT} />
                      ) : (
                        <Plus size={18} weight={ICON_WEIGHT} />
                      )}
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  hidden={!isOpen}
                  className="text-ls-accordion-answer max-w-[40em] pr-14 pb-[clamp(40px,4vw,64px)] text-[clamp(17px,1.2vw,21px)] leading-[1.7] text-pretty"
                >
                  {trimmed(item?.answer)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
