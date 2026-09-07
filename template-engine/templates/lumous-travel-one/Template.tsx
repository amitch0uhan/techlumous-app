"use client"

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from "@phosphor-icons/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Manrope } from "next/font/google"
import Image from "next/image"
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react"

import PlaceholderLogo from "../../component/placeholder-logo"
import type { LumousTravelOneContent } from "./schema"

import "./styles.css"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
})

// Assign the generated family on the template root: a var() in a :root @theme
// token cannot see a next/font variable declared further down the tree.
const fontTokens = {
  "--font-lt-display": manrope.style.fontFamily,
  "--font-lt-body": manrope.style.fontFamily,
  "--font-lt-label": manrope.style.fontFamily,
} as CSSProperties

// Lays content back onto the shared column inside a full-bleed section.
const CONTENT = "mx-auto w-full max-w-[1440px] px-[clamp(20px,4vw,64px)]"

// Same, applied to each direct child so the section keeps its own background.
const CONTENT_CHILDREN =
  "[&>*]:mx-auto [&>*]:w-full [&>*]:max-w-[1440px] [&>*]:px-[clamp(20px,4vw,64px)]"

const SECTION_RADIUS = "rounded-[clamp(18px,2vw,28px)]"

const PACKAGE_WIDTH_ACTIVE = "clamp(280px, 46vw, 640px)"
const PACKAGE_WIDTH_IDLE = "clamp(170px, 22vw, 300px)"
const PACKAGE_GAP = "clamp(12px, 1.5vw, 20px)"
const REGION_ROW = "clamp(34px, 3.4vw, 46px)"
// Defined by `.lt-destination-carousel` in styles.css, incl. its mobile override.
const DESTINATION_SLIDE = "var(--lt-slide)"

// Content is editable, possibly older JSON: read through loose shapes + optional chaining.
type Content = LumousTravelOneContent
type HeroCard = Partial<Content["heroCards"][number]>
type Destination = Partial<Content["destinations"][number]>
type Testimonial = Partial<Content["testimonials"][number]>
type WhyItem = Partial<Content["whyItems"][number]>
type PackageItem = Partial<Content["packages"][number]>
type FooterLink = Partial<Content["footerLinks"][number]>
type Colors = Partial<Content["colors"]>

// Pre-`colors`-group content carried three flat accent keys; still honoured below.
type LegacyColors = {
  primaryColor?: unknown
  secondaryColor?: unknown
  onPrimaryColor?: unknown
}

const join = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ")

const pad = (value: number) => String(value).padStart(2, "0")

const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : [])

const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

// A cleared image field renders nothing; `next/image` rejects an empty `src`.
function ContentImage({
  src,
  alt,
  ...rest
}: Omit<ComponentProps<typeof Image>, "src"> & { src: unknown }) {
  const url = trimmed(src)
  if (url.length === 0) return null
  return <Image src={url} alt={alt} {...rest} />
}

// Renders *asterisk pairs* as bright inline runs against the dimmed line.
function emphasise(value: unknown): ReactNode {
  const source = typeof value === "string" ? value : ""
  if (!source.includes("*")) return source
  return source.split(/\*([^*]+)\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="text-lt-strong font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

const ICON_WEIGHT = "light" as const

const BUTTON_SIZE = {
  sm: "h-9 gap-1.5 px-4 text-[0.875rem]",
  md: "h-11 gap-2 px-[22px] text-base",
  lg: "h-[54px] gap-2.5 px-[30px] text-[1.0625rem]",
} as const

const BUTTON_VARIANT = {
  primary: "bg-lt-primary text-lt-on-primary lt-glow-sm hover:brightness-110",
  secondary:
    "text-lt-strong hover:border-lt-primary hover:text-lt-primary border border-lt-border/20",
  white: "bg-lt-on-image text-lt-on-light lt-shadow-button font-light",
} as const

const ICON_SIZE = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-[54px] w-[54px]",
} as const

function CtaPair({
  label,
  href,
  variant = "primary",
  size = "md",
  className,
}: {
  label: unknown
  href: unknown
  variant?: keyof typeof BUTTON_VARIANT
  size?: keyof typeof BUTTON_SIZE
  className?: string
}) {
  const text = trimmed(label)
  if (text.length === 0) return null
  const target = trimmed(href) || "#"
  const iconSize = size === "lg" ? 20 : 18

  return (
    <span className={join("inline-flex items-center gap-2.5", className)}>
      <a
        href={target}
        className={join(
          "ease-lt-standard tracking-lt-snug inline-flex items-center justify-center rounded-full leading-none font-semibold whitespace-nowrap transition-all duration-200",
          BUTTON_SIZE[size],
          BUTTON_VARIANT[variant]
        )}
      >
        {text}
      </a>
      <a
        href={target}
        aria-label={text}
        className={join(
          "text-lt-strong hover:border-lt-primary hover:text-lt-primary ease-lt-standard border-lt-border/20 inline-flex items-center justify-center rounded-full border transition-colors duration-200",
          ICON_SIZE[size]
        )}
      >
        <ArrowUpRight size={iconSize} weight={ICON_WEIGHT} aria-hidden="true" />
      </a>
    </span>
  )
}

function CarouselButton({
  label,
  direction,
  onClick,
  className,
}: {
  label: string
  direction: "prev" | "next"
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={join(
        "grid cursor-pointer place-items-center rounded-full transition-colors duration-200",
        className
      )}
    >
      {direction === "prev" ? (
        <ArrowLeft size={17} weight={ICON_WEIGHT} aria-hidden="true" />
      ) : (
        <ArrowRight size={17} weight={ICON_WEIGHT} aria-hidden="true" />
      )}
    </button>
  )
}

function Eyebrow({
  index,
  label,
  onPanel = false,
}: {
  index: string
  label: unknown
  onPanel?: boolean
}) {
  return (
    <div className="font-lt-label text-lt-xs tracking-lt-eyebrow flex flex-col gap-1.5 font-extralight uppercase">
      {index.length > 0 ? (
        <span className={onPanel ? "text-lt-on-image/55" : "text-lt-subtle"}>
          {index}
        </span>
      ) : null}
      <span className={onPanel ? "text-lt-on-image" : "text-lt-body"}>
        {trimmed(label)}
      </span>
    </div>
  )
}

export function Template({ content }: { content: Content }) {
  const c = (content ?? {}) as Partial<Content>

  const heroCards = list<HeroCard>(c.heroCards)
  const heroTags = list<string>(c.heroTags)
  const destinations = list<Destination>(c.destinations)
  const testimonials = list<Testimonial>(c.testimonials)
  const whyItems = list<WhyItem>(c.whyItems)
  const packages = list<PackageItem>(c.packages)
  const footerLinks = list<FooterLink>(c.footerLinks)
  const studioLines = list<string>(c.contactStudioLines)
  const reachLines = list<string>(c.contactReachLines)

  const [heroRaw, setHero] = useState(0)
  const [destRaw, setDest] = useState(0)
  const [openRow, setOpenRow] = useState(0)
  const [pkgRaw, setPkg] = useState(0)

  // Clamp every carousel index at read time: collections shrink when entries are removed.
  const heroIndex =
    heroCards.length > 0 ? Math.min(heroRaw, heroCards.length - 1) : 0
  const destIndex =
    destinations.length > 0 ? Math.min(destRaw, destinations.length - 1) : 0
  const pkgIndex =
    packages.length > 0 ? Math.min(pkgRaw, packages.length - 1) : 0
  const activeDestination = destinations[destIndex]

  // Missing = visible; only `false` (or the legacy string "hide") removes a section.
  const hidden = (value: unknown) => value === false || value === "hide"
  const show = {
    nav: !hidden(c.showNav),
    hero: !hidden(c.showHero),
    about: !hidden(c.showAbout),
    destinations: !hidden(c.showDestinations),
    testimonials: !hidden(c.showTestimonials),
    why: !hidden(c.showWhyUs),
    packages: !hidden(c.showPackages),
    contact: !hidden(c.showContact),
    footer: !hidden(c.showFooter),
  }

  // Numbered from what actually renders, so hiding a section renumbers the rest.
  const numbered = (
    [
      show.about && "about",
      show.destinations && "destinations",
      show.testimonials && "testimonials",
      show.why && "why",
      show.packages && "packages",
      show.contact && "contact",
    ] as Array<string | false>
  ).filter((value): value is string => typeof value === "string")

  const sectionNumber = (key: string) => {
    const index = numbered.indexOf(key)
    return index < 0 ? "" : `(${pad(index + 1)})`
  }

  // Redeclare the palette on the root so every `*-lt-*` utility and styles.css
  // class resolves to the studio value. `hue()` guards content predating `colors`.
  const colors = (c.colors ?? {}) as Colors
  const legacy = c as LegacyColors
  const hue = (value: unknown, fallback: string, older?: unknown) =>
    trimmed(value) || trimmed(older) || fallback

  const brandStyle = {
    ...fontTokens,

    "--color-lt-canvas": hue(colors.canvas, "#07080A"),
    "--color-lt-nav-surface": hue(colors.navSurface, "#0F0F12"),
    "--color-lt-card-surface": hue(colors.cardSurface, "#131317"),
    "--color-lt-panel-surface": hue(colors.panelSurface, "#1C1C22"),

    "--color-lt-primary": hue(
      colors.accentPrimary,
      "#3AAE7E",
      legacy.primaryColor
    ),
    "--color-lt-secondary": hue(
      colors.accentSecondary,
      "#1F6B4E",
      legacy.secondaryColor
    ),
    "--color-lt-on-primary": hue(
      colors.accentForeground,
      "#06120D",
      legacy.onPrimaryColor
    ),

    "--color-lt-strong": hue(colors.textStrong, "#FFFFFF"),
    "--color-lt-body": hue(colors.textBody, "#E8E6DF"),
    "--color-lt-muted": hue(colors.textMuted, "#B4B1A7"),
    "--color-lt-subtle": hue(colors.textSubtle, "#807D75"),

    "--color-lt-on-image": hue(colors.onImage, "#FFFFFF"),
    "--color-lt-on-light": hue(colors.onLight, "#0A0A0B"),

    "--color-lt-border": hue(colors.border, "#FFFFFF"),
    "--color-lt-scrim": hue(colors.scrim, "#07080A"),
    "--color-lt-shadow": hue(colors.shadow, "#000000"),
  } as CSSProperties

  const rootRef = useRef<HTMLDivElement | null>(null)

  // Scroll-reveal only. The hidden start state is set here, so without JS or
  // with reduced-motion every section renders in its resting state.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    gsap.registerPlugin(ScrollTrigger)

    let triggers: ScrollTrigger[] = []

    // Reveal targets whose start is past the furthest reachable scroll can never
    // fire (the non-scrolling studio preview), so settle them visible on refresh.
    const settleUnreachable = () => {
      const furthest = ScrollTrigger.maxScroll(window)
      const stranded = triggers.filter((trigger) => trigger.start > furthest)
      if (stranded.length === 0) return

      triggers = triggers.filter((trigger) => !stranded.includes(trigger))
      for (const trigger of stranded) {
        trigger.kill()
        gsap.set(trigger.trigger as HTMLElement, { opacity: 1, y: 0 })
      }
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-lt-reveal]").forEach((element) => {
        const tween = gsap.fromTo(
          element,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          }
        )
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
      })

      settleUnreachable()
    }, root)

    ScrollTrigger.addEventListener("refresh", settleUnreachable)

    return () => {
      ScrollTrigger.removeEventListener("refresh", settleUnreachable)
      triggers = []
      ctx.revert()
    }
  }, [])

  const brandName = trimmed(c.brandName)
  const logo = trimmed(c.logoUrl)

  // Uploaded logo in a fixed-height box that grows to `maxWidth` (object-contain,
  // never cropped); otherwise the engine's shared placeholder mark.
  const brandMark = (size: number, maxWidth: number) =>
    logo.length > 0 ? (
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ height: size, minWidth: size, maxWidth }}
      >
        <Image
          src={logo}
          alt={brandName || "Logo"}
          width={maxWidth}
          height={size}
          className="block h-full w-auto max-w-full object-contain"
        />
      </span>
    ) : (
      <PlaceholderLogo size={size} className="block shrink-0" />
    )

  const navBar = show.nav ? (
    <nav className="relative z-10 flex flex-wrap items-center justify-between gap-4">
      <a href="#top" className="text-lt-on-image flex items-center gap-3">
        {brandMark(38, 200)}
        <span className="font-lt-display tracking-lt-snug text-lt-on-image text-[clamp(15px,1.2vw,18px)] font-light">
          {brandName}
        </span>
      </a>
      {/* Dropped on mobile; the contact section carries the same action. */}
      <CtaPair
        label={c.navCtaLabel}
        href={c.navCtaHref}
        variant="white"
        size="md"
        className="lt-mobile:hidden"
      />
    </nav>
  ) : null

  return (
    <div
      ref={rootRef}
      style={brandStyle}
      className="bg-lt-canvas text-lt-body font-lt-body min-h-screen overflow-x-hidden"
    >
      <div className="flex flex-col gap-[clamp(24px,3vw,56px)] p-[clamp(8px,1vw,16px)]">
        {show.hero ? (
          <section
            id="top"
            className={join(
              SECTION_RADIUS,
              "relative flex min-h-[clamp(600px,92vh,900px)] flex-col justify-between overflow-hidden py-[clamp(16px,2.2vw,28px)]"
            )}
          >
            <ContentImage
              src={c.heroImageUrl}
              alt={trimmed(c.heroImageAlt)}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="lt-scrim-hero absolute inset-0"
            />

            <div className={join(CONTENT, "relative z-10")}>{navBar}</div>

            <div
              className={join(
                CONTENT,
                "relative z-10 mt-[clamp(48px,8vw,120px)] flex flex-col gap-[clamp(28px,4vw,56px)]"
              )}
            >
              <h1 className="font-lt-display text-lt-display-lg tracking-lt-tight text-lt-on-image m-0 max-w-[20ch] leading-[1.06] font-extralight text-balance">
                {emphasise(c.heroHeadline)}
              </h1>

              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(20px,3vw,40px)]">
                {heroTags.length > 0 ? (
                  <div className="flex max-w-[460px] flex-wrap gap-2.5">
                    {heroTags.map((tag, index) => (
                      <span
                        key={`${String(tag)}-${index}`}
                        className="text-lt-sm border-lt-border/[0.14] bg-lt-on-image/[0.03] text-lt-on-image rounded-full border px-[18px] py-[9px] backdrop-blur-[16px] backdrop-saturate-[1.2]"
                      >
                        {typeof tag === "string" ? tag : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {heroCards.length > 0 ? (
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-on-image/70 flex items-center gap-3.5 font-extralight">
                      <span>{pad(heroIndex + 1)}</span>
                      <span className="bg-lt-on-image/[0.28] relative h-px flex-1 overflow-hidden">
                        <span
                          className="ease-lt-standard bg-lt-on-image absolute inset-y-0 left-0 transition-[width] duration-200"
                          style={{
                            width: `${((heroIndex + 1) / heroCards.length) * 100}%`,
                          }}
                        />
                      </span>
                      <span>{pad(heroCards.length)}</span>
                      <CarouselButton
                        label="Previous trip"
                        direction="prev"
                        onClick={() =>
                          setHero(
                            (heroIndex + heroCards.length - 1) %
                              heroCards.length
                          )
                        }
                        className="border-lt-border/30 bg-lt-on-image/10 text-lt-on-image h-[30px] w-[30px] border"
                      />
                      <CarouselButton
                        label="Next trip"
                        direction="next"
                        onClick={() =>
                          setHero((heroIndex + 1) % heroCards.length)
                        }
                        className="border-lt-border/30 bg-lt-on-image/10 text-lt-on-image h-[30px] w-[30px] border"
                      />
                    </div>

                    <div className="overflow-hidden">
                      <div
                        className="ease-lt-emphasis flex gap-3 transition-transform duration-[360ms]"
                        style={{
                          transform: `translateX(calc(${-heroIndex} * (clamp(240px, 78%, 320px) + 12px)))`,
                        }}
                      >
                        {heroCards.map((card, index) => (
                          <article
                            key={index}
                            className="lt-shadow-float border-lt-border/[0.18] flex flex-[0_0_clamp(240px,78%,320px)] gap-3 rounded-[14px] border p-3 backdrop-blur-[4px] backdrop-saturate-[1.15]"
                          >
                            <ContentImage
                              src={card?.imageUrl}
                              alt={trimmed(card?.imageAlt)}
                              width={84}
                              height={78}
                              className="h-[78px] w-[84px] flex-none rounded-[9px] object-cover"
                            />
                            <div className="flex min-w-0 flex-col justify-between gap-2.5">
                              <p className="font-lt-display text-lt-on-image m-0 text-base font-light">
                                {trimmed(card?.title)}
                              </p>
                              <p className="font-lt-label text-lt-on-image/70 m-0 text-[10.5px] font-extralight tracking-[0.12em] uppercase">
                                {trimmed(card?.meta)}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          navBar && (
            <section
              id="top"
              className={join(
                SECTION_RADIUS,
                "bg-lt-nav-surface relative py-[clamp(16px,2.2vw,28px)]"
              )}
            >
              <div className={CONTENT}>{navBar}</div>
            </section>
          )
        )}

        {show.about ? (
          <section
            id="about"
            data-lt-reveal
            className="py-[clamp(88px,11vw,180px)]"
          >
            <div
              className={join(
                CONTENT,
                "grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,72px)]"
              )}
            >
              <div className="flex flex-col justify-between gap-[clamp(40px,8vw,120px)]">
                <Eyebrow
                  index={sectionNumber("about")}
                  label={c.aboutEyebrow}
                />
                <p className="font-lt-label text-lt-xs text-lt-muted m-0 max-w-[46ch] leading-[1.9] font-extralight tracking-[0.06em] uppercase">
                  {trimmed(c.aboutIntro)}
                </p>
              </div>
              <div className="flex flex-col gap-[clamp(28px,3vw,44px)]">
                <h2 className="font-lt-display text-lt-display-md text-lt-body/[0.58] m-0 leading-[1.02] font-extralight tracking-[-0.04em] text-pretty">
                  {emphasise(c.aboutHeadline)}
                </h2>
                <div>
                  <CtaPair
                    label={c.aboutCtaLabel}
                    href={c.aboutCtaHref}
                    variant="secondary"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {show.destinations ? (
          <section
            id="destinations"
            data-lt-reveal
            className={join(
              SECTION_RADIUS,
              CONTENT_CHILDREN,
              "py-[clamp(64px,8vw,140px)]"
            )}
            style={{
              background:
                "color-mix(in oklab, var(--color-lt-panel-surface) 82%, var(--color-lt-primary) 18%)",
            }}
          >
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
              <div className="flex flex-col gap-[clamp(20px,3vw,36px)]">
                <Eyebrow
                  index={sectionNumber("destinations")}
                  label={c.destinationsEyebrow}
                />
                <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-strong m-0 max-w-[24ch] leading-[1.14] font-extralight text-pretty">
                  {emphasise(c.destinationsHeadline)}
                </h2>
              </div>

              {destinations.length > 0 ? (
                // Vertical region picker; hidden on mobile, arrows replace it.
                <div
                  className="lt-mobile:hidden w-full justify-self-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%,#000_68%,transparent_100%)]"
                  style={{
                    height: `calc(4 * (${REGION_ROW} + 10px))`,
                    paddingTop: `calc(${REGION_ROW} * 0.5)`,
                  }}
                >
                  <div
                    className="ease-lt-emphasis flex flex-col items-end gap-2.5 text-right transition-transform duration-[480ms]"
                    style={{
                      transform: `translateY(calc(-1 * ${destIndex} * (${REGION_ROW} + 10px)))`,
                    }}
                  >
                    {destinations.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setDest(index)}
                        aria-current={index === destIndex}
                        className="font-lt-display tracking-lt-snug text-lt-strong ease-lt-standard flex cursor-pointer items-center border-none bg-transparent p-0 text-right text-[clamp(20px,2vw,28px)] transition-opacity duration-300"
                        style={{
                          flex: `0 0 ${REGION_ROW}`,
                          height: REGION_ROW,
                          opacity:
                            index === destIndex
                              ? 1
                              : Math.max(
                                  0.16,
                                  0.62 - Math.abs(index - destIndex) * 0.16
                                ),
                        }}
                      >
                        {trimmed(item?.region)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {destinations.length > 0 ? (
              <div className="mt-[clamp(56px,7vw,104px)] flex flex-wrap items-end gap-[clamp(24px,3vw,40px)]">
                <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-[18px] pb-[clamp(8px,2vw,40px)]">
                  <p className="font-lt-display text-lt-strong m-0 text-[clamp(18px,1.6vw,22px)] font-medium">
                    {trimmed(activeDestination?.title)}
                  </p>
                  <p className="text-lt-sm text-lt-muted m-0 max-w-[34ch] leading-[1.7]">
                    {trimmed(activeDestination?.body)}
                  </p>
                </div>

                {/* Full width on mobile (one whole slide) vs. the 1.5-slide desktop peek. */}
                <div className="lt-destination-carousel lt-mobile:ml-0 lt-mobile:flex-[0_0_100%] ml-auto flex-[0_0_min(68vw,940px,100%)] overflow-hidden">
                  <div
                    className="ease-lt-emphasis flex items-start gap-[clamp(12px,1.5vw,20px)] transition-transform duration-[420ms]"
                    style={{
                      transform: `translateX(calc(${-destIndex} * (${DESTINATION_SLIDE} + clamp(12px, 1.5vw, 20px))))`,
                    }}
                  >
                    {destinations.map((item, index) => (
                      <div
                        key={index}
                        className="relative aspect-4/3 overflow-hidden rounded-xl"
                        style={{
                          flex: `0 0 ${DESTINATION_SLIDE}`,
                          width: DESTINATION_SLIDE,
                        }}
                      >
                        <ContentImage
                          src={item?.imageUrl}
                          alt={trimmed(item?.imageAlt)}
                          fill
                          sizes="(min-width: 1024px) 45vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-[clamp(18px,2vw,26px)] flex items-center gap-3">
                    <CarouselButton
                      label="Previous destination"
                      direction="prev"
                      onClick={() =>
                        setDest(
                          (destIndex + destinations.length - 1) %
                            destinations.length
                        )
                      }
                      className="text-lt-strong border-lt-border/20 h-[34px] w-[34px] border bg-transparent"
                    />
                    <CarouselButton
                      label="Next destination"
                      direction="next"
                      onClick={() =>
                        setDest((destIndex + 1) % destinations.length)
                      }
                      className="bg-lt-primary text-lt-on-primary border-lt-border/20 h-[34px] w-[34px] border"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {show.testimonials ? (
          <section
            data-lt-reveal
            className={join(
              CONTENT,
              "flex flex-col gap-[clamp(56px,7vw,110px)] py-[clamp(88px,11vw,180px)]"
            )}
          >
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(24px,4vw,64px)]">
              <div className="flex flex-col gap-[clamp(20px,3vw,32px)]">
                <Eyebrow
                  index={sectionNumber("testimonials")}
                  label={c.testimonialsEyebrow}
                />
                <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-body/[0.58] m-0 max-w-[24ch] leading-[1.14] font-extralight text-pretty">
                  {emphasise(c.testimonialsHeadline)}
                </h2>
              </div>
              {/* Right-aligned by the headline on desktop, left edge once stacked. */}
              <p className="text-lt-sm text-lt-muted lt-mobile:justify-self-start lt-mobile:my-[clamp(10px,3vw,20px)] lt-mobile:text-left m-0 max-w-[40ch] justify-self-end text-right leading-[1.75]">
                {trimmed(c.testimonialsNote)}
              </p>
            </div>

            {testimonials.length > 0 ? (
              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
                {testimonials.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lt-lg bg-lt-card-surface lt-shadow-card border-lt-border/10 border p-[clamp(24px,2.6vw,34px)]"
                  >
                    <div className="flex h-full flex-col gap-[clamp(20px,3vw,32px)]">
                      <p className="font-lt-display tracking-lt-snug text-lt-strong m-0 text-[clamp(16px,1.4vw,19px)] leading-[1.5] font-extralight text-pretty">
                        &ldquo;{trimmed(item?.quote)}&rdquo;
                      </p>
                      <div className="mt-auto flex items-center gap-3">
                        <ContentImage
                          src={item?.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col gap-[3px]">
                          <span className="text-lt-sm text-lt-body">
                            {trimmed(item?.name)}
                          </span>
                          <span className="font-lt-label text-lt-subtle text-[12.5px] font-extralight tracking-[0.12em] uppercase">
                            {trimmed(item?.trip)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {show.why ? (
          <section
            data-lt-reveal
            className={join(
              SECTION_RADIUS,
              CONTENT_CHILDREN,
              "py-[clamp(64px,8vw,140px)]"
            )}
            style={{
              background:
                "color-mix(in oklab, var(--color-lt-secondary) 30%, var(--color-lt-panel-surface))",
            }}
          >
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
              <Eyebrow
                index={sectionNumber("why")}
                label={c.whyEyebrow}
                onPanel
              />
              <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-on-image/60 m-0 max-w-[30ch] leading-[1.14] font-extralight text-pretty">
                {emphasise(c.whyHeadline)}
              </h2>
            </div>

            <div className="mt-[clamp(36px,5vw,72px)] flex flex-col">
              {whyItems.map((item, index) => {
                const isOpen = index === openRow
                return (
                  <div
                    key={index}
                    className={join(
                      "border-lt-border/[0.09] border-t",
                      index === whyItems.length - 1 && "border-b"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenRow(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center gap-[clamp(16px,3vw,48px)] border-none bg-transparent py-[clamp(18px,2.2vw,28px)] text-left"
                    >
                      <span className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-on-image/60 flex-[0_0_44px] font-extralight">
                        {pad(index + 1)}
                      </span>
                      <span className="font-lt-display tracking-lt-snug text-lt-on-image flex-1 text-[clamp(24px,2.8vw,40px)] font-light">
                        {trimmed(item?.title)}
                      </span>
                      <span
                        aria-hidden="true"
                        className={join(
                          "border-lt-border/35 text-lt-on-image grid h-[34px] w-[34px] flex-[0_0_34px] place-items-center rounded-full border transition-transform duration-300",
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
                        <p className="text-lt-sm text-lt-on-image/[0.78] m-0 max-w-[62ch] pb-[clamp(20px,2.4vw,30px)] pl-[clamp(60px,6vw,92px)] leading-[1.75]">
                          {trimmed(item?.body)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {show.packages ? (
          <section
            id="packages"
            data-lt-reveal
            className={join(CONTENT, "py-[clamp(64px,8vw,140px)]")}
          >
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-[clamp(28px,4vw,64px)]">
              <div className="flex flex-col gap-[clamp(20px,3vw,32px)]">
                <Eyebrow
                  index={sectionNumber("packages")}
                  label={c.packagesEyebrow}
                />
                <h2 className="font-lt-display text-lt-display-md tracking-lt-tight text-lt-body/[0.58] m-0 max-w-[26ch] leading-[1.14] font-extralight text-pretty">
                  {emphasise(c.packagesHeadline)}
                </h2>
              </div>
              <div className="lt-mobile:items-start lt-mobile:justify-self-start lt-mobile:my-[clamp(10px,3vw,20px)] lt-mobile:text-left flex flex-col items-end gap-6 justify-self-end text-right">
                <p className="text-lt-sm text-lt-muted m-0 max-w-[42ch] leading-[1.75]">
                  {trimmed(c.packagesNote)}
                </p>
                <CtaPair
                  label={c.packagesCtaLabel}
                  href={c.packagesCtaHref}
                  variant="secondary"
                  size="md"
                />
              </div>
            </div>

            {packages.length > 0 ? (
              <>
                <div className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-muted mt-[clamp(32px,4vw,56px)] flex items-center gap-3.5 font-extralight">
                  <CarouselButton
                    label="Previous package"
                    direction="prev"
                    onClick={() =>
                      setPkg((pkgIndex + packages.length - 1) % packages.length)
                    }
                    className="text-lt-strong border-lt-border/20 h-10 w-10 border bg-transparent"
                  />
                  <CarouselButton
                    label="Next package"
                    direction="next"
                    onClick={() => setPkg((pkgIndex + 1) % packages.length)}
                    className="bg-lt-primary text-lt-on-primary border-lt-border/20 h-10 w-10 border"
                  />
                  <span>
                    {pad(pkgIndex + 1)} / {pad(packages.length)}
                  </span>
                </div>

                <div className="[margin-inline:calc(-1*clamp(20px,4vw,64px))] mt-[clamp(20px,2.5vw,32px)] overflow-hidden">
                  <div
                    className="ease-lt-emphasis flex items-stretch gap-[clamp(12px,1.5vw,20px)] transition-transform duration-[460ms]"
                    style={{
                      transform: `translateX(calc(clamp(20px, 4vw, 64px) - ${pkgIndex} * (${PACKAGE_WIDTH_IDLE} + ${PACKAGE_GAP})))`,
                    }}
                  >
                    {packages.map((item, index) => {
                      const isActive = index === pkgIndex
                      const title = trimmed(item?.title)
                      return (
                        <article
                          key={index}
                          className="rounded-lt-lg ease-lt-emphasis relative flex min-h-[clamp(400px,46vw,520px)] flex-col justify-between overflow-hidden p-[clamp(20px,2.4vw,28px)] transition-[flex-basis] duration-[460ms]"
                          style={{
                            flex: `0 0 ${
                              isActive
                                ? PACKAGE_WIDTH_ACTIVE
                                : PACKAGE_WIDTH_IDLE
                            }`,
                          }}
                        >
                          <ContentImage
                            src={item?.imageUrl}
                            alt={trimmed(item?.imageAlt)}
                            fill
                            sizes="(min-width: 1024px) 45vw, 90vw"
                            className="object-cover"
                          />
                          <div
                            aria-hidden="true"
                            className="lt-scrim-card absolute inset-0"
                          />

                          {/* Whole inactive panel selects; the CTA only exists once open. */}
                          {!isActive ? (
                            <button
                              type="button"
                              onClick={() => setPkg(index)}
                              aria-label={title || `Package ${index + 1}`}
                              className="absolute inset-0 z-20 cursor-pointer bg-transparent"
                            />
                          ) : null}

                          <div
                            className={join(
                              "relative z-10 flex-wrap justify-end gap-2",
                              isActive ? "flex" : "hidden"
                            )}
                          >
                            {list<string>(item?.tags).map((tag, tagIndex) => (
                              <span
                                key={`${String(tag)}-${tagIndex}`}
                                className="font-lt-label border-lt-border/[0.28] bg-lt-on-image/[0.14] text-lt-on-image flex-none rounded-full border px-3.5 py-[7px] text-[12.5px] font-extralight tracking-[0.12em] whitespace-nowrap uppercase backdrop-blur-[8px]"
                              >
                                {typeof tag === "string" ? tag : ""}
                              </span>
                            ))}
                          </div>

                          <div className="relative z-10 flex flex-col gap-4">
                            <h3 className="font-lt-display tracking-lt-snug text-lt-on-image m-0 text-[clamp(20px,2vw,26px)] font-medium">
                              {title}
                            </h3>
                            <p
                              className={join(
                                "text-lt-sm text-lt-on-image/80 m-0 max-w-[40ch] leading-[1.65]",
                                isActive ? "block" : "hidden"
                              )}
                            >
                              {trimmed(item?.body)}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="font-lt-label text-lt-xs tracking-lt-eyebrow text-lt-on-image font-extralight">
                                {trimmed(item?.price)}
                              </span>
                              {isActive ? (
                                <a
                                  href={trimmed(c.packagesCtaHref) || "#"}
                                  className="bg-lt-primary text-lt-on-primary ease-lt-standard inline-flex h-9 items-center justify-center rounded-full px-4 text-[0.875rem] leading-none font-semibold whitespace-nowrap transition-all duration-200 hover:brightness-110"
                                >
                                  {trimmed(c.packagesDetailsLabel)}
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {show.contact ? (
          <section
            id="contact"
            data-lt-reveal
            className={join(
              CONTENT,
              "flex flex-col gap-[clamp(40px,6vw,96px)] pt-[clamp(88px,11vw,180px)] pb-[clamp(10px,1vw,14px)]"
            )}
          >
            <Eyebrow
              index={sectionNumber("contact")}
              label={c.contactEyebrow}
            />
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] items-end gap-[clamp(32px,5vw,72px)]">
              <h2 className="font-lt-display text-lt-display-lg tracking-lt-tight text-lt-strong m-0 leading-[1.1] font-extralight text-pretty">
                {emphasise(c.contactHeadline)}{" "}
                {/* Inline after the headline on desktop, its own line on mobile. */}
                <span className="lt-mobile:mt-[clamp(24px,6vw,40px)] lt-mobile:ml-0 lt-mobile:flex ml-3.5 inline-flex items-center align-middle">
                  <CtaPair
                    label={c.contactCtaLabel}
                    href={c.contactCtaHref}
                    variant="primary"
                    size="lg"
                  />
                </span>
              </h2>

              <div className="text-lt-sm text-lt-muted grid [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] gap-[clamp(20px,3vw,36px)] leading-[1.8]">
                <div className="flex flex-col gap-2">
                  <span className="font-lt-label text-lt-subtle text-[12.5px] font-extralight tracking-[0.14em] uppercase">
                    {trimmed(c.contactStudioLabel)}
                  </span>
                  <span>
                    {studioLines.map((line, index) => (
                      <span key={index} className="block">
                        {typeof line === "string" ? line : ""}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-lt-label text-lt-subtle text-[12.5px] font-extralight tracking-[0.14em] uppercase">
                    {trimmed(c.contactReachLabel)}
                  </span>
                  <span>
                    {reachLines.map((line, index) => (
                      <span key={index} className="block">
                        {typeof line === "string" ? line : ""}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {show.footer ? (
          <footer
            className={join(
              CONTENT,
              // `items-stretch` keeps the brand lockup left-aligned once stacked.
              "lt-mobile:flex-col lt-mobile:items-stretch border-lt-border/10 flex flex-wrap items-center justify-between gap-[clamp(20px,3vw,40px)] border-t pt-[clamp(24px,2.5vw,32px)] pb-[clamp(8px,0.8vw,12px)]"
            )}
          >
            <a href="#top" className="text-lt-strong flex items-center gap-3">
              {brandMark(30, 160)}
              <span className="font-lt-display text-lt-sm tracking-lt-snug text-lt-subtle font-light">
                {brandName}
              </span>
            </a>
            <div className="font-lt-label lt-mobile:justify-center flex flex-wrap gap-[clamp(16px,2.5vw,32px)] text-xs font-extralight tracking-[0.1em] uppercase">
              {footerLinks.map((item, index) => (
                <a
                  key={index}
                  href={trimmed(item?.href) || "#"}
                  className="text-lt-subtle hover:text-lt-primary transition-colors"
                >
                  {trimmed(item?.label)}
                </a>
              ))}
            </div>
            <span className="font-lt-label text-lt-subtle lt-mobile:text-center text-xs font-extralight tracking-[0.1em]">
              {trimmed(c.footerCopyright)}
            </span>
          </footer>
        ) : null}
      </div>
    </div>
  )
}
