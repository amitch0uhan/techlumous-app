import { ArrowUpRight } from "@phosphor-icons/react"

import {
  COLUMN,
  external,
  H2,
  ICON_WEIGHT,
  join,
  record,
  SECTION_Y,
  trimmed,
  type Content,
  type Project,
} from "../lib"
import { ContentImage } from "./content-image"
import { Eyebrow } from "./eyebrow"
import { Words } from "./words"

export function Work({
  work,
  projects,
}: {
  work: unknown
  projects: Project[]
}) {
  const w = record<Content["work"]>(work)
  return (
    <section id="work" className={join(COLUMN, SECTION_Y, "scroll-mt-20")}>
      <div
        data-reveal
        className="mb-[clamp(48px,7vw,104px)] flex flex-wrap items-end justify-between gap-6"
      >
        <div className="grid gap-5">
          <Eyebrow label={w.eyebrow} />
          <h2 data-heading-words className={H2}>
            <Words text={trimmed(w.heading)} />
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-[clamp(32px,4vw,56px)]">
        {projects.map((project, index) => {
          // The first project is featured across the full row.
          const featured = index === 0
          const title = trimmed(project?.title)
          const meta = trimmed(project?.meta)
          const href = trimmed(project?.href)
          return (
            <article
              key={index}
              data-reveal
              className={join(
                // A linked card is one hover target: its arrow link is
                // stretched over the whole card (see the anchor below).
                "group/project relative grid min-w-0 content-start gap-5",
                featured && "col-span-full",
                href.length > 0 && "cursor-pointer"
              )}
            >
              <div
                className={join(
                  "bg-ls-border/[0.06] relative w-full overflow-hidden",
                  featured
                    ? "ls-work-featured rounded-[clamp(24px,3vw,40px)]"
                    : "aspect-4/3 rounded-[clamp(24px,3vw,36px)]"
                )}
              >
                <ContentImage
                  src={project?.imageUrl}
                  alt={project?.imageAlt}
                  sizes={
                    featured
                      ? "(max-width: 1280px) 100vw, 1200px"
                      : "(max-width: 900px) 100vw, 600px"
                  }
                />
              </div>
              <div className="flex items-start justify-between gap-5">
                <div className="grid min-w-0 gap-2">
                  <h3
                    data-heading-words
                    className={join(
                      "font-ls-display text-ls-heading m-0 font-medium tracking-[-0.02em]",
                      featured
                        ? "text-[clamp(28px,3vw,44px)]"
                        : "text-[clamp(26px,2.4vw,36px)]"
                    )}
                  >
                    <Words text={title} />
                  </h3>
                  <p
                    className={join(
                      "text-ls-foreground m-0 text-base leading-[1.65] text-pretty",
                      featured && "max-w-[40em]"
                    )}
                  >
                    {trimmed(project?.body)}
                  </p>
                  {meta.length > 0 ? (
                    <p className="font-ls-mono text-ls-heading/80 m-0 text-[13px]">
                      {meta}
                    </p>
                  ) : null}
                </div>
                {href.length > 0 ? (
                  <a
                    href={href}
                    {...external(href)}
                    aria-label={`View ${title} project`}
                    className={join(
                      "border-ls-work-arrow-border/[0.28] text-ls-work-arrow-foreground group-hover/project:border-ls-work-arrow-hover-background group-hover/project:bg-ls-work-arrow-hover-background group-hover/project:text-ls-work-arrow-hover-foreground group-focus-within/project:border-ls-work-arrow-hover-background group-focus-within/project:bg-ls-work-arrow-hover-background group-focus-within/project:text-ls-work-arrow-hover-foreground grid flex-none place-items-center rounded-full border transition-colors",
                      // Stretched hit area: the whole card opens the project.
                      "after:absolute after:inset-0 after:z-2 after:content-['']",
                      featured ? "size-15" : "size-14"
                    )}
                  >
                    <ArrowUpRight
                      size={featured ? 22 : 20}
                      weight={ICON_WEIGHT}
                      aria-hidden="true"
                    />
                  </a>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
