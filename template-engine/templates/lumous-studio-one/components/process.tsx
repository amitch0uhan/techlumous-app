import {
  COLUMN,
  H2_LARGE,
  join,
  pad,
  record,
  SECTION_Y,
  trimmed,
  type Content,
  type ProcessStep,
} from "../lib"
import { Words } from "./words"

export function Process({
  process,
  steps,
}: {
  process: unknown
  steps: ProcessStep[]
}) {
  const p = record<Content["process"]>(process)
  return (
    <section id="process" className={join(COLUMN, SECTION_Y, "scroll-mt-20")}>
      <div className="flex flex-wrap items-start gap-[clamp(32px,6vw,120px)]">
        <div
          data-reveal
          className="ls-wide:sticky ls-wide:top-[clamp(40px,12vh,120px)] flex-[1_1_280px]"
        >
          <h2 data-heading-words className={H2_LARGE}>
            <Words text={trimmed(p.heading)} />
          </h2>
          <p className="text-ls-foreground mt-[clamp(20px,2vw,28px)] mb-0 max-w-[24em] text-[clamp(16px,1.2vw,19px)] leading-[1.65] text-pretty">
            {trimmed(p.body)}
          </p>
        </div>

        <ol className="ls-steps m-0 min-w-0 flex-[1.9_1_480px] list-none p-0">
          {steps.map((step, index) => {
            const timing = trimmed(step?.timing)
            return (
              <li
                key={index}
                className="border-ls-process-step-divider/90 border-t-2"
              >
                <div
                  data-step
                  className="grid pt-[clamp(48px,5vw,80px)] pb-[clamp(64px,6vw,104px)]"
                >
                  <h3 className="font-ls-display text-ls-process-step-title m-0 text-[clamp(22px,1.7vw,30px)] leading-[1.2] font-medium tracking-[-0.015em]">
                    {trimmed(step?.title)}
                  </h3>
                  <p className="text-ls-process-step-subtitle mt-2 mb-0 text-[clamp(16px,1.1vw,19px)] leading-[1.45]">
                    {trimmed(step?.subtitle)}
                  </p>
                  <p className="text-ls-process-step-body mt-[clamp(28px,3vw,44px)] mb-0 max-w-[40em] text-[clamp(17px,1.2vw,21px)] leading-[1.7] text-pretty">
                    {trimmed(step?.body)}
                  </p>
                  <p className="font-ls-mono text-ls-process-step-meta mt-[clamp(24px,2.4vw,36px)] mb-0 text-[13px]">
                    <span className="text-ls-process-step-number">
                      {pad(index + 1)}
                    </span>
                    {timing.length > 0 ? ` — ${timing}` : null}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
