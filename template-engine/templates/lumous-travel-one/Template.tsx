"use client"

import { Manrope } from "next/font/google"
import { useRef, type CSSProperties } from "react"

import { useCarousel } from "../../hooks/use-carousel"
import { useScrollReveal } from "../../hooks/use-scroll-reveal"
import { About } from "./components/about"
import { Contact } from "./components/contact"
import { Destinations } from "./components/destinations"
import { Footer } from "./components/footer"
import { Hero } from "./components/hero"
import { NavBar, NavSection } from "./components/nav-bar"
import { Packages } from "./components/packages"
import { Testimonials } from "./components/testimonials"
import { WhyUs } from "./components/why-us"
import {
  list,
  pad,
  paletteStyle,
  trimmed,
  type Colors,
  type Content,
  type Destination,
  type FooterLink,
  type HeroCard,
  type PackageItem,
  type PartialContent,
  type Testimonial,
  type WhyItem,
} from "./lib"

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

// Missing = visible; only `false` (or the legacy string "hide") removes a section.
const hidden = (value: unknown) => value === false || value === "hide"

/** Sections that carry an eyebrow number, in render order. */
const NUMBERED_SECTIONS = [
  "about",
  "destinations",
  "testimonials",
  "why",
  "packages",
  "contact",
] as const

export function Template({
  content,
  design,
}: {
  content: Content
  design: { colors: Colors }
}) {
  const c = (content ?? {}) as PartialContent

  const heroCards = list<HeroCard>(c.heroCards)
  const heroTags = list<string>(c.heroTags)
  const destinations = list<Destination>(c.destinations)
  const testimonials = list<Testimonial>(c.testimonials)
  const whyItems = list<WhyItem>(c.whyItems)
  const packages = list<PackageItem>(c.packages)
  const footerLinks = list<FooterLink>(c.footerLinks)
  const studioLines = list<string>(c.contactStudioLines)
  const reachLines = list<string>(c.contactReachLines)

  const heroCarousel = useCarousel(heroCards.length)
  const destinationCarousel = useCarousel(destinations.length)
  const packageCarousel = useCarousel(packages.length)

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
  const numbered = NUMBERED_SECTIONS.filter((key) => show[key])
  const sectionNumber = (key: (typeof NUMBERED_SECTIONS)[number]) => {
    const index = numbered.indexOf(key)
    return index < 0 ? "" : `(${pad(index + 1)})`
  }

  // Write the whole palette onto the root so every `*-lt-*` utility, surface
  // class and styles.css effect resolves to the studio design value.
  const brandStyle = {
    ...fontTokens,
    ...paletteStyle(design?.colors),
  } as CSSProperties

  const rootRef = useRef<HTMLDivElement | null>(null)
  useScrollReveal(rootRef)

  const brandName = trimmed(c.brandName)
  const logo = trimmed(c.logoUrl)

  const navBar = show.nav ? (
    <NavBar
      brandName={brandName}
      logo={logo}
      ctaLabel={c.navCtaLabel}
      ctaHref={c.navCtaHref}
    />
  ) : null

  return (
    <div
      ref={rootRef}
      style={brandStyle}
      className="lt-root lt-surface-page bg-lt-background text-lt-foreground font-lt-body min-h-screen overflow-x-hidden"
    >
      <div className="flex flex-col gap-[clamp(24px,3vw,56px)] p-[clamp(8px,1vw,16px)]">
        {show.hero ? (
          <Hero
            content={c}
            cards={heroCards}
            tags={heroTags}
            carousel={heroCarousel}
            navBar={navBar}
          />
        ) : (
          navBar && <NavSection>{navBar}</NavSection>
        )}

        {show.about ? (
          <About content={c} number={sectionNumber("about")} />
        ) : null}

        {show.destinations ? (
          <Destinations
            content={c}
            items={destinations}
            carousel={destinationCarousel}
            number={sectionNumber("destinations")}
          />
        ) : null}

        {show.testimonials ? (
          <Testimonials
            content={c}
            items={testimonials}
            number={sectionNumber("testimonials")}
          />
        ) : null}

        {show.why ? (
          <WhyUs content={c} items={whyItems} number={sectionNumber("why")} />
        ) : null}

        {show.packages ? (
          <Packages
            content={c}
            items={packages}
            carousel={packageCarousel}
            number={sectionNumber("packages")}
          />
        ) : null}

        {show.contact ? (
          <Contact
            content={c}
            studioLines={studioLines}
            reachLines={reachLines}
            number={sectionNumber("contact")}
          />
        ) : null}

        {show.footer ? (
          <Footer
            brandName={brandName}
            logo={logo}
            links={footerLinks}
            copyright={c.footerCopyright}
          />
        ) : null}
      </div>
    </div>
  )
}
