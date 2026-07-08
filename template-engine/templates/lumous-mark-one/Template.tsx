"use client"

import { Archivo, Inter, JetBrains_Mono } from "next/font/google"
import Image from "next/image"
import { useState } from "react"

import PlaceholderLogo from "../../component/placeholder-logo"
import Icon from "./icon"
import type { LumousMarkOneContent } from "./schema"

import "./styles.css"

// Self-hosted via next/font — no external <link>, no coupling to the engine's
// layout. Each font publishes its family through the same CSS var the template's
// @theme declares, so the font-display / font-sans / font-jb utilities resolve
// to it once the variable classes are on the root element below.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb",
  display: "swap",
})

const fontVars = `${archivo.variable} ${inter.variable} ${jetbrainsMono.variable}`

export function Template({ content }: { content: LumousMarkOneContent }) {
  const { brand, nav, hero, features, about, contact, footer } = content
  // Which discipline is open; -1 means all collapsed. First is open by default.
  const [open, setOpen] = useState(0)

  return (
    <div
      className={`${fontVars} bg-ink text-paper selection:bg-flame selection:text-ink relative min-h-screen overflow-x-hidden font-sans`}
    >
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-white/6 bg-[rgba(10,10,11,0.55)] px-[clamp(20px,5vw,64px)] py-5 backdrop-blur-[14px]">
        <div className="flex items-center gap-2.5">
          <PlaceholderLogo size={18} />
          <span className="font-light tracking-[-0.02em]">{brand}</span>
        </div>
        <div className="flex gap-[clamp(18px,3vw,32px)]">
          {nav.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="font-jb hover:text-neon text-[11px] tracking-[0.14em] text-muted uppercase transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative px-[clamp(20px,5vw,64px)] pt-[clamp(70px,12vw,150px)] pb-[clamp(80px,9vw,120px)]">
        <div className="animate-drift pointer-events-none absolute top-[52%] left-[52%] z-0 h-[min(46vw,420px)] w-[min(70vw,720px)] bg-[radial-gradient(ellipse_at_center,rgba(255,59,30,0.55),rgba(255,59,30,0)_62%)] blur-[46px]" />
        <p className="font-jb relative z-2 mb-[clamp(24px,4vw,48px)] text-[12px] tracking-[0.22em] text-muted uppercase">
          {hero.eyebrow}
        </p>
        <h1 className="font-display relative z-2 m-0 w-[85vw] text-[clamp(36px,8.2vw,120px)] leading-[0.96] font-light tracking-[-0.01em] text-balance uppercase">
          {hero.headlineTop}
          <br />
          {hero.headlineMid}{" "}
          <span className="relative inline-block">
            {hero.headlineHighlight}
            <svg
              viewBox="0 0 320 120"
              preserveAspectRatio="none"
              className="pointer-events-none absolute top-[-16%] left-[-8%] z-[-1] h-[132%] w-[116%] overflow-visible"
            >
              <ellipse
                cx="160"
                cy="60"
                rx="150"
                ry="48"
                fill="none"
                strokeWidth="3"
                transform="rotate(-4 160 60)"
                className="stroke-neon filter-[drop-shadow(0_0_8px_rgba(198,242,78,0.6))]"
              />
            </svg>
          </span>{" "}
          {hero.headlineEnd}
        </h1>

        <div className="relative z-2 mt-[clamp(32px,5vw,52px)] flex flex-wrap items-center gap-4">
          <span className="text-paper inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/3 px-[18px] py-[9px] text-[13px]">
            <span className="text-flame bg-flame h-2 w-2 rounded-full"></span>{" "}
            {hero.badgeText}
          </span>
          <span className="font-jb text-[11px] tracking-[0.14em] text-muted uppercase">
            {hero.badgeMeta.join(" · ")}
          </span>
        </div>
      </header>

      {/* FEATURES ACCORDION */}
      <section className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,6vw,70px)]">
        <p className="font-jb mb-[clamp(20px,4vw,44px)] text-[12px] tracking-[0.22em] text-muted uppercase">
          {features.eyebrow}
        </p>
        <div>
          {features.items.map((item, i) => {
            const expanded = i === open
            const num = String(i + 1).padStart(2, "0")
            return (
              <div
                key={i}
                onClick={() => setOpen(expanded ? -1 : i)}
                className="grid cursor-pointer grid-cols-[clamp(110px,20vw,260px)_1fr] items-start gap-[clamp(16px,4vw,56px)] border-t border-white/10 py-[clamp(8px,2vw,18px)]"
              >
                {/* The number is always clipped by its window; opening just
                    eases the window taller so the digit is unveiled downward
                    from its already-half-shown state — no pop. */}
                <div
                  className={`overflow-hidden transition-[height] duration-500 ease-in-out ${
                    expanded
                      ? "h-[clamp(72px,18vw,210px)]"
                      : "h-[clamp(44px,10vw,104px)]"
                  }`}
                >
                  <div
                    className={`font-display text-[clamp(72px,18vw,210px)] leading-[0.82] font-extralight tracking-[-0.04em] transition-colors duration-500 ${
                      expanded ? "text-paper" : "text-dim"
                    }`}
                  >
                    {num}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h2
                      className={`font-display m-0 text-[clamp(20px,3.4vw,40px)] font-light tracking-[-0.01em] uppercase transition-colors duration-500 ${
                        expanded ? "text-paper" : "text-muted"
                      }`}
                    >
                      {item.title}
                    </h2>
                    <span
                      className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border border-white/20 text-[18px] transition-transform duration-500 ${
                        expanded
                          ? "text-paper rotate-180"
                          : "rotate-0 text-muted"
                      }`}
                    >
                      {expanded ? "−" : "+"}
                    </span>
                  </div>
                  {/* Body stays mounted and eases open via a 0fr→1fr grid row
                      (smooth height with no measured pixels) plus a fade, so the
                      content settles instead of jittering in. */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      expanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="max-w-[520px] pt-4 pb-[22px]">
                        <p className="mb-5 text-[15px] leading-[1.6] text-muted">
                          {item.body}
                        </p>
                        <div className="flex flex-wrap gap-8">
                          {item.meta.map((m, mi) => (
                            <div key={mi}>
                              <div className="font-jb text-faint mb-[5px] text-[10px] tracking-[0.16em] uppercase">
                                {m.label}
                              </div>
                              <div className="text-paper text-[14px]">
                                {m.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="border-t border-white/10" />
        </div>
      </section>

      {/* ABOUT / SOCIAL PROOF */}
      <section className="px-[clamp(20px,5vw,64px)] py-[clamp(76px,7vw,90px)]">
        <div className="grid grid-cols-1 items-end gap-[clamp(20px,3vw,36px)] lg:grid-cols-[3fr_2fr]">
          <div className="relative aspect-16/11 overflow-hidden bg-[#111] filter-[grayscale(0.35)_contrast(1.05)_brightness(0.85)]">
            {about.imageUrl ? (
              <Image
                src={about.imageUrl}
                alt={about.imageAlt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="font-jb text-faint flex h-full w-full items-center justify-center text-[11px] tracking-[0.14em] uppercase">
                Studio photo
              </div>
            )}
          </div>
          <div>
            <p className="font-jb mb-[22px] text-[12px] tracking-[0.22em] text-muted uppercase">
              {about.eyebrow}
            </p>
            <p className="font-display text-paper m-0 text-[clamp(20px,2.6vw,30px)] leading-[1.35] font-medium tracking-[-0.01em]">
              {about.statement}{" "}
              <span className="text-muted">{about.statementMuted}</span>
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="relative overflow-hidden px-[clamp(20px,5vw,64px)] py-[clamp(92px,12vw,150px)] text-center">
        <div className="pointer-events-none absolute top-[56%] left-1/2 z-0 h-[min(40vw,340px)] w-[min(80vw,760px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,59,30,0.5),rgba(255,59,30,0)_64%)] blur-[50px]" />
        <p className="font-jb relative z-2 mb-[clamp(20px,3vw,32px)] text-[12px] tracking-[0.22em] text-muted uppercase">
          {contact.eyebrow}
        </p>
        <div className="relative z-2 inline-block">
          <a
            href={contact.href}
            className="font-display text-paper hover:text-neon inline-flex items-center gap-[0.12em] text-[clamp(44px,11vw,140px)] leading-[0.9] font-light tracking-[-0.01em] uppercase"
          >
            {contact.headline}
            <Icon className="h-[0.72em] w-[0.72em] shrink-0 translate-y-[0.04em]" />
          </a>
          <svg
            viewBox="0 0 420 40"
            preserveAspectRatio="none"
            className="mx-auto mt-[6px] block h-[34px] w-[min(70%,420px)] overflow-visible"
          >
            <path
              d="M4 24 C 60 6, 110 34, 168 18 S 280 4, 340 24 S 410 30, 416 16"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="700"
              strokeDashoffset="700"
              className="animate-dash stroke-neon filter-[drop-shadow(0_0_9px_rgba(198,242,78,0.7))]"
            />
          </svg>
        </div>
        <p className="relative z-2 mt-[clamp(26px,4vw,40px)] text-[15px] text-muted">
          {contact.contactLine}
        </p>
      </section>

      {/* FOOTER */}
      <footer className="relative flex flex-col items-center border-t border-white/8 px-[clamp(20px,5vw,64px)] pt-[clamp(72px,8vw,90px)] pb-8">
        <div className="mb-[clamp(44px,7vw,72px)] text-center">
          <div className="font-display text-[clamp(20px,3vw,30px)] font-light tracking-[-0.01em]">
            {footer.wordmark}
          </div>
        </div>
        <div className="grid w-full max-w-[1000px] grid-cols-2 justify-center gap-x-[clamp(28px,4vw,48px)] gap-y-9 md:grid-cols-[repeat(auto-fit,minmax(150px,max-content))]">
          {footer.columns.map((col, ci) => (
            <div key={ci}>
              <div className="font-jb text-faint mb-4 items-center text-center text-[10px] tracking-[0.18em] uppercase">
                {col.title}
              </div>
              {col.items.map((row, ri) => (
                <div key={ri} className="mb-2.5 text-center">
                  <a
                    href={row.href}
                    className="hover:text-neon text-[14px] text-muted"
                  >
                    {row.label}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="font-jb text-faint mt-[clamp(44px,7vw,72px)] flex max-w-[1000px] min-w-full flex-wrap justify-between gap-3 border-t border-white/6 pt-6 text-[10px] tracking-widest uppercase">
          <span>{footer.copyright}</span>
          <span>{footer.tagline}</span>
        </div>
      </footer>
    </div>
  )
}
