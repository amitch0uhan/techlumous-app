"use client"

import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google"
import { useRef, type CSSProperties } from "react"

import { useScrollReveal } from "../../hooks/use-scroll-reveal"
import { About } from "./components/about"
import { Audiences } from "./components/audiences"
import { Contact } from "./components/contact"
import { Cta } from "./components/cta"
import { Faq } from "./components/faq"
import { Feature } from "./components/feature"
import { Footer } from "./components/footer"
import { Hero } from "./components/hero"
import { Process } from "./components/process"
import { Services } from "./components/services"
import { SiteChrome } from "./components/site-chrome"
import { Testimonials } from "./components/testimonials"
import { Work } from "./components/work"
import {
  join,
  list,
  paletteStyle,
  record,
  trimmed,
  type AboutPillar,
  type AudienceCard,
  type Colors,
  type ContactDetail,
  type Content,
  type FaqItem,
  type FooterLink,
  type Hero as HeroContent,
  type PartialContent,
  type ProcessStep,
  type Project,
  type ServiceCard,
  type TestimonialCard,
} from "./lib"
import { useHeroEntrance, useScrollScrubs } from "./motion"

import "./styles.css"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
})

const body = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

// Assign the generated families on the template root: a var() in a :root
// @theme token cannot see a next/font variable declared further down the tree.
const fontTokens = {
  "--font-ls-display": display.style.fontFamily,
  "--font-ls-body": body.style.fontFamily,
  "--font-ls-mono": mono.style.fontFamily,
} as CSSProperties

// Missing = visible; only an explicit `false` removes a section.
const hidden = (value: unknown) => value === false

export function Template({
  content,
  design,
}: {
  content: Content
  design: { colors: Colors }
}) {
  const c = (content ?? {}) as PartialContent

  const brandName = trimmed(c.brandName)
  const bookingLabel = trimmed(c.bookingLabel)
  const bookingUrl = trimmed(c.bookingUrl)
  const animate = !hidden(c.animations)

  const show = {
    feature: !hidden(c.showFeature),
    about: !hidden(c.showAbout),
    process: !hidden(c.showProcess),
    services: !hidden(c.showServices),
    work: !hidden(c.showWork),
    audiences: !hidden(c.showAudiences),
    testimonials: !hidden(c.showTestimonials),
    cta: !hidden(c.showCta),
    faq: !hidden(c.showFaq),
    contact: !hidden(c.showContact),
  }

  // Write the whole palette onto the root so every `*-ls-*` utility, surface
  // class and styles.css effect resolves to the studio design value.
  const rootStyle = {
    ...fontTokens,
    ...paletteStyle(design?.colors),
  } as CSSProperties

  const rootRef = useRef<HTMLDivElement | null>(null)
  useScrollReveal(rootRef, {
    // With motion off, match nothing so every block stays in its resting state.
    selector: animate ? "[data-reveal]" : "[data-ls-reveal-off]",
    distance: 28,
    duration: 0.8,
    ease: "power3.out",
  })
  useHeroEntrance(rootRef, animate)
  useScrollScrubs(rootRef, animate, content)

  return (
    <div
      ref={rootRef}
      style={rootStyle}
      className={join(
        // `overflow-x-clip`, not hidden: hidden would become the scroll
        // container and break the sticky columns and service card stack.
        "ls-root ls-surface-page bg-ls-background text-ls-foreground font-ls-body relative min-h-screen overflow-x-clip antialiased",
        !animate && "ls-still"
      )}
    >
      <SiteChrome
        brandName={brandName}
        bookingLabel={bookingLabel}
        bookingUrl={bookingUrl}
      />

      <main id="main">
        <Hero hero={record<HeroContent>(c.hero)} />

        {show.feature ? <Feature feature={c.feature} /> : null}

        {show.about ? (
          <About about={c.about} pillars={list<AboutPillar>(c.aboutPillars)} />
        ) : null}

        {show.process ? (
          <Process
            process={c.process}
            steps={list<ProcessStep>(c.processSteps)}
          />
        ) : null}

        {show.services ? (
          <Services
            services={c.services}
            cards={list<ServiceCard>(c.serviceCards)}
            bookingLabel={bookingLabel}
            bookingUrl={bookingUrl}
          />
        ) : null}

        {show.work ? (
          <Work work={c.work} projects={list<Project>(c.projects)} />
        ) : null}

        {show.audiences ? (
          <Audiences
            audiences={c.audiences}
            cards={list<AudienceCard>(c.audienceCards)}
          />
        ) : null}

        {show.testimonials ? (
          <Testimonials
            testimonials={c.testimonials}
            cards={list<TestimonialCard>(c.testimonialCards)}
          />
        ) : null}

        {show.cta ? (
          <Cta
            cta={c.cta}
            bookingLabel={bookingLabel}
            bookingUrl={bookingUrl}
          />
        ) : null}

        {show.faq ? (
          <Faq faq={c.faq} items={list<FaqItem>(c.faqItems)} />
        ) : null}

        {show.contact ? (
          <Contact
            contact={c.contact}
            details={list<ContactDetail>(c.contactDetails)}
            bookingLabel={bookingLabel}
            bookingUrl={bookingUrl}
          />
        ) : null}
      </main>

      <Footer
        footer={c.footer}
        brandName={brandName}
        bookingLabel={bookingLabel}
        bookingUrl={bookingUrl}
        socialLinks={list<FooterLink>(c.socialLinks)}
        legalLinks={list<FooterLink>(c.legalLinks)}
      />
    </div>
  )
}
