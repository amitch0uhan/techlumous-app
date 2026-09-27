import { z } from "zod"

import { area, color, image, link, text, visibility } from "@/templates/fields"

/**
 * The single source of every default colour. Surface groups (page, accent,
 * highlight, light, card, footer) colour free text by where it sits — each is
 * one card/panel *treatment*, reused by every section that paints it. Every
 * other group belongs to one component category and paints only that
 * component. `cardArrow*` and `tag*` come in a light and an on-dark variant;
 * the surface a card sits on picks which one applies (see styles.css).
 * Dividers, outlines and tints use a fixed opacity at the call site, so their
 * defaults are the plain ink colour.
 */
export const DEFAULT_COLORS = {
  buttonPrimary: {
    background: "#111113",
    foreground: "#F2F1EC",
    hoverBackground: "#2A2A31",
    iconBackground: "#D6FF3F",
    iconForeground: "#111113",
  },
  buttonOutline: {
    foreground: "#F2F1EC",
    border: "#F2F1EC",
    hoverBackground: "#F2F1EC",
    hoverForeground: "#111113",
  },
  page: {
    background: "#0D0D0F",
    heading: "#F2F1EC",
    foreground: "#A9A8A2",
    eyebrow: "#C7B8FF",
    border: "#F2F1EC",
  },
  accent: {
    background: "#D6FF3F",
    heading: "#111113",
    foreground: "#2B2B28",
    border: "#111113",
  },
  highlight: {
    background: "#C7B8FF",
    heading: "#111113",
    foreground: "#2B2B28",
    border: "#111113",
  },
  light: {
    background: "#EEECE6",
    heading: "#111113",
    foreground: "#2B2B28",
    mutedForeground: "#555552",
    eyebrow: "#5A45B8",
    border: "#111113",
  },
  card: {
    background: "#1D1D22",
    heading: "#F2F1EC",
    foreground: "#A9A8A2",
    border: "#F2F1EC",
  },
  footer: {
    background: "#0D0D0F",
    heading: "#F2F1EC",
    foreground: "#A9A8A2",
    mutedForeground: "#8C8B85",
    border: "#F2F1EC",
  },
  buttonSecondary: {
    foreground: "#111113",
    border: "#111113",
    hoverBackground: "#111113",
  },
  buttonAccent: {
    background: "#D6FF3F",
    foreground: "#111113",
    hoverBackground: "#E6FF85",
  },
  heroPill: {
    background: "#D6FF3F",
    foreground: "#111113",
  },
  heroIcons: {
    foreground: "#D6FF3F",
  },
  processStep: {
    number: "#D6FF3F",
    title: "#F2F1EC",
    subtitle: "#B9B8B2",
    body: "#A9A8A2",
    meta: "#C9C8C2",
    divider: "#F2F1EC",
  },
  cardArrow: {
    background: "#111113",
    foreground: "#D6FF3F",
    hoverBackground: "#2A2A31",
  },
  cardArrowOnDark: {
    background: "#D6FF3F",
    foreground: "#111113",
    hoverBackground: "#E6FF85",
  },
  tag: {
    foreground: "#111113",
    border: "#111113",
  },
  tagOnDark: {
    foreground: "#F2F1EC",
    border: "#F2F1EC",
  },
  workArrow: {
    foreground: "#F2F1EC",
    border: "#F2F1EC",
    hoverBackground: "#D6FF3F",
    hoverForeground: "#111113",
  },
  accordion: {
    question: "#F2F1EC",
    answer: "#A9A8A2",
    divider: "#F2F1EC",
    icon: "#F2F1EC",
    iconBorder: "#F2F1EC",
  },
  statusBadge: {
    background: "#FFFFFF",
    foreground: "#111113",
    dot: "#5E9A00",
  },
  contactLink: {
    foreground: "#111113",
    hoverForeground: "#5A45B8",
  },
  socialLink: {
    foreground: "#C9C8C2",
    border: "#F2F1EC",
    hoverBackground: "#F2F1EC",
    hoverForeground: "#111113",
  },
  footerLink: {
    foreground: "#A9A8A2",
    hoverForeground: "#F2F1EC",
  },
  backToTop: {
    background: "#17171B",
    foreground: "#F2F1EC",
    border: "#F2F1EC",
    hoverBackground: "#D6FF3F",
    hoverForeground: "#111113",
  },
  skipLink: {
    background: "#D6FF3F",
    foreground: "#111113",
  },
  effects: {
    ring: "#D6FF3F",
    shadow: "#000000",
  },
} as const

const C = DEFAULT_COLORS

// `.prefault({})` re-parses so the leaf defaults fill a missing group.
export const designSchema = z.object({
  colors: z
    .object({
      buttonPrimary: z
        .object({
          background: color("Button background", C.buttonPrimary.background),
          foreground: color("Button text", C.buttonPrimary.foreground),
          hoverBackground: color(
            "Button on hover",
            C.buttonPrimary.hoverBackground
          ),
          iconBackground: color(
            "Arrow circle background",
            C.buttonPrimary.iconBackground
          ),
          iconForeground: color("Arrow icon", C.buttonPrimary.iconForeground),
        })
        .meta({
          label: "Primary button (Call to action band, Contact)",
          collapsed: true,
        })
        .prefault({}),

      buttonOutline: z
        .object({
          foreground: color("Text & arrow", C.buttonOutline.foreground),
          border: color("Outline", C.buttonOutline.border),
          hoverBackground: color(
            "Fill on hover",
            C.buttonOutline.hoverBackground
          ),
          hoverForeground: color(
            "Text on hover",
            C.buttonOutline.hoverForeground
          ),
        })
        .meta({ label: "Header button", collapsed: true })
        .prefault({}),

      page: z
        .object({
          background: color("Page background", C.page.background),
          heading: color("Headings & brand name", C.page.heading),
          foreground: color("Body text", C.page.foreground),
          eyebrow: color("Eyebrow labels above headings", C.page.eyebrow),
          border: color("Dividers & image placeholders", C.page.border),
        })
        .meta({
          label:
            "Page (Hero, About, Process, Work, Who we work with, Reviews, FAQ)",
          collapsed: true,
        })
        .prefault({}),

      accent: z
        .object({
          background: color("Panel background", C.accent.background),
          heading: color("Headings & quotes", C.accent.heading),
          foreground: color("Body text", C.accent.foreground),
          border: color("Outlines & image placeholders", C.accent.border),
        })
        .meta({
          label:
            "Lime panels (1st service, 2nd audience card, 3rd review, Call to action band)",
          collapsed: true,
        })
        .prefault({}),

      highlight: z
        .object({
          background: color("Panel background", C.highlight.background),
          heading: color("Headings & quotes", C.highlight.heading),
          foreground: color("Body text", C.highlight.foreground),
          border: color("Outlines & image placeholders", C.highlight.border),
        })
        .meta({
          label: "Lavender panels (2nd service, 3rd audience card, 1st review)",
          collapsed: true,
        })
        .prefault({}),

      light: z
        .object({
          background: color("Panel background", C.light.background),
          heading: color("Headings", C.light.heading),
          foreground: color("Body text", C.light.foreground),
          mutedForeground: color(
            "Contact detail labels",
            C.light.mutedForeground
          ),
          eyebrow: color("Eyebrow label", C.light.eyebrow),
          border: color("Dividers & image placeholders", C.light.border),
        })
        .meta({
          label: "Cream panels (3rd service, 4th audience card, Contact)",
          collapsed: true,
        })
        .prefault({}),

      card: z
        .object({
          background: color("Card background", C.card.background),
          heading: color("Headings & quotes", C.card.heading),
          foreground: color("Body text", C.card.foreground),
          border: color("Outline & image placeholders", C.card.border),
        })
        .meta({
          label:
            "Dark cards (4th service, 1st & 5th audience cards, 2nd review)",
          collapsed: true,
        })
        .prefault({}),

      footer: z
        .object({
          background: color("Footer background", C.footer.background),
          heading: color("Brand name", C.footer.heading),
          foreground: color("Tagline", C.footer.foreground),
          mutedForeground: color(
            "Copyright & small labels",
            C.footer.mutedForeground
          ),
          border: color("Top divider", C.footer.border),
        })
        .meta({ label: "Footer", collapsed: true })
        .prefault({}),

      buttonSecondary: z
        .object({
          foreground: color("Button text", C.buttonSecondary.foreground),
          border: color("Outline", C.buttonSecondary.border),
          hoverBackground: color(
            "Tint on hover",
            C.buttonSecondary.hoverBackground
          ),
        })
        .meta({
          label: "Secondary button (Call to action band)",
          collapsed: true,
        })
        .prefault({}),

      buttonAccent: z
        .object({
          background: color("Button background", C.buttonAccent.background),
          foreground: color("Button text", C.buttonAccent.foreground),
          hoverBackground: color(
            "Button on hover",
            C.buttonAccent.hoverBackground
          ),
        })
        .meta({ label: "Footer button", collapsed: true })
        .prefault({}),

      heroPill: z
        .object({
          background: color("Pill background", C.heroPill.background),
          foreground: color("Scrolling word & dots", C.heroPill.foreground),
        })
        .meta({ label: "Hero headline pill", collapsed: true })
        .prefault({}),

      heroIcons: z
        .object({
          foreground: color("Floating icons", C.heroIcons.foreground),
        })
        .meta({ label: "Hero floating icons", collapsed: true })
        .prefault({}),

      processStep: z
        .object({
          number: color("Step number", C.processStep.number),
          title: color("Step title", C.processStep.title),
          subtitle: color("Step subtitle", C.processStep.subtitle),
          body: color("Step description", C.processStep.body),
          meta: color("Timing line", C.processStep.meta),
          divider: color("Step dividers", C.processStep.divider),
        })
        .meta({ label: "Process steps", collapsed: true })
        .prefault({}),

      cardArrow: z
        .object({
          background: color("Circle background", C.cardArrow.background),
          foreground: color("Arrow icon", C.cardArrow.foreground),
          hoverBackground: color(
            "Circle on hover",
            C.cardArrow.hoverBackground
          ),
        })
        .meta({
          label: "Service card arrows (lime, lavender & cream cards)",
          collapsed: true,
        })
        .prefault({}),

      cardArrowOnDark: z
        .object({
          background: color("Circle background", C.cardArrowOnDark.background),
          foreground: color("Arrow icon", C.cardArrowOnDark.foreground),
          hoverBackground: color(
            "Circle on hover",
            C.cardArrowOnDark.hoverBackground
          ),
        })
        .meta({ label: "Service card arrows (dark cards)", collapsed: true })
        .prefault({}),

      tag: z
        .object({
          foreground: color("Tag text", C.tag.foreground),
          border: color("Tag outline", C.tag.border),
        })
        .meta({
          label: "Audience tags (lime, lavender & cream cards)",
          collapsed: true,
        })
        .prefault({}),

      tagOnDark: z
        .object({
          foreground: color("Tag text", C.tagOnDark.foreground),
          border: color("Tag outline", C.tagOnDark.border),
        })
        .meta({ label: "Audience tags (dark cards)", collapsed: true })
        .prefault({}),

      workArrow: z
        .object({
          foreground: color("Arrow icon", C.workArrow.foreground),
          border: color("Circle outline", C.workArrow.border),
          hoverBackground: color(
            "Circle on hover",
            C.workArrow.hoverBackground
          ),
          hoverForeground: color("Arrow on hover", C.workArrow.hoverForeground),
        })
        .meta({ label: "Project links (Selected work)", collapsed: true })
        .prefault({}),

      accordion: z
        .object({
          question: color("Question", C.accordion.question),
          answer: color("Answer", C.accordion.answer),
          divider: color("Row dividers", C.accordion.divider),
          icon: color("Plus / minus icon", C.accordion.icon),
          iconBorder: color("Icon outline", C.accordion.iconBorder),
        })
        .meta({ label: "FAQ list", collapsed: true })
        .prefault({}),

      statusBadge: z
        .object({
          background: color("Badge background", C.statusBadge.background),
          foreground: color("Badge text", C.statusBadge.foreground),
          dot: color("Status dot", C.statusBadge.dot),
        })
        .meta({ label: "Availability badge (Contact)", collapsed: true })
        .prefault({}),

      contactLink: z
        .object({
          foreground: color("Email & phone links", C.contactLink.foreground),
          hoverForeground: color(
            "Links on hover",
            C.contactLink.hoverForeground
          ),
        })
        .meta({ label: "Contact links", collapsed: true })
        .prefault({}),

      socialLink: z
        .object({
          foreground: color("Text & icon", C.socialLink.foreground),
          border: color("Outline", C.socialLink.border),
          hoverBackground: color("Fill on hover", C.socialLink.hoverBackground),
          hoverForeground: color("Text on hover", C.socialLink.hoverForeground),
        })
        .meta({ label: "Social links (Footer)", collapsed: true })
        .prefault({}),

      footerLink: z
        .object({
          foreground: color("Legal links", C.footerLink.foreground),
          hoverForeground: color(
            "Links on hover",
            C.footerLink.hoverForeground
          ),
        })
        .meta({ label: "Legal links (Footer)", collapsed: true })
        .prefault({}),

      backToTop: z
        .object({
          background: color("Button background", C.backToTop.background),
          foreground: color("Arrow icon", C.backToTop.foreground),
          border: color("Outline", C.backToTop.border),
          hoverBackground: color(
            "Background on hover",
            C.backToTop.hoverBackground
          ),
          hoverForeground: color("Arrow on hover", C.backToTop.hoverForeground),
        })
        .meta({ label: "Back-to-top button", collapsed: true })
        .prefault({}),

      skipLink: z
        .object({
          background: color("Link background", C.skipLink.background),
          foreground: color("Link text", C.skipLink.foreground),
        })
        .meta({
          label: "'Skip to content' link (keyboard only)",
          collapsed: true,
        })
        .prefault({}),

      effects: z
        .object({
          ring: color("Keyboard focus outline", C.effects.ring),
          shadow: color("Service card shadows", C.effects.shadow),
        })
        .meta({ label: "Focus & shadows", collapsed: true })
        .prefault({}),
    })
    .meta({ label: "Colours", collapsed: false })
    .prefault({}),
})
export type LumousStudioOneDesign = z.infer<typeof designSchema>
export const defaultDesign: LumousStudioOneDesign = designSchema.parse({})

export const contentSchema = z.object({
  brandName: text("Studio name"),
  bookingLabel: text("Booking button label"),
  bookingUrl: link("Booking link (every 'Book a call' button)"),
  animations: visibility("Scroll & entrance animations"),

  hero: z
    .object({
      headlineStart: text("Headline — first line"),
      headlineMiddle: text("Headline — words before the pill"),
      pillWord: text("Headline — word scrolling in the pill"),
      headlineEnd: text("Headline — last line"),
      intro: area("Intro paragraph (lights up on scroll)"),
      // Added after first release: the default lets earlier content publish.
      fallingIcons: z
        .enum(["default", "asterisk"])
        .meta({
          label:
            "Falling icons (default = design tool icons, asterisk = asterisks only)",
        })
        .default("default"),
    })
    .meta({ label: "Hero", collapsed: true }),

  showFeature: visibility("Show feature image"),
  feature: z
    .object({
      imageUrl: image("Image"),
      imageAlt: text("Image alt text"),
    })
    .meta({ label: "Feature image", collapsed: true }),

  showAbout: visibility("Show about"),
  about: z
    .object({
      eyebrow: text("Eyebrow"),
      heading: area("Heading"),
    })
    .meta({ label: "About", collapsed: true }),
  aboutPillars: z
    .array(
      z.object({
        title: text("Title"),
        body: area("Body"),
      })
    )
    .meta({ label: "About — pillars" }),

  showProcess: visibility("Show process"),
  process: z
    .object({
      heading: text("Heading"),
      body: area("Intro"),
    })
    .meta({ label: "Process", collapsed: true }),
  processSteps: z
    .array(
      z.object({
        title: text("Title"),
        subtitle: text("Subtitle"),
        body: area("Description"),
        timing: text("Timing (e.g. Week 1)"),
      })
    )
    .meta({ label: "Process — steps" }),

  showServices: visibility("Show services"),
  services: z
    .object({
      eyebrow: text("Eyebrow"),
      heading: area("Heading"),
    })
    .meta({ label: "Services", collapsed: true }),
  serviceCards: z
    .array(
      z.object({
        title: text("Title"),
        body: area("Description"),
        imageUrl: image("Image"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Services — cards" }),

  showWork: visibility("Show selected work"),
  work: z
    .object({
      eyebrow: text("Eyebrow"),
      heading: text("Heading"),
    })
    .meta({ label: "Selected work", collapsed: true }),
  projects: z
    .array(
      z.object({
        title: text("Title"),
        body: area("Description"),
        meta: text("Client type · services"),
        href: link("Project link"),
        imageUrl: image("Image"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Selected work — projects (first is featured)" }),

  showAudiences: visibility("Show who we work with"),
  audiences: z
    .object({
      heading: text("Heading"),
      body: area("Intro"),
      showImages: visibility("Show card images"),
    })
    .meta({ label: "Who we work with", collapsed: true }),
  audienceCards: z
    .array(
      z.object({
        title: text("Title"),
        tags: z.array(z.string()).meta({ label: "Tags" }),
        body: area("Description"),
        imageUrl: image("Image (transparent PNG works best)"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Who we work with — cards (first is wide)" }),

  showTestimonials: visibility("Show client reviews"),
  testimonials: z
    .object({
      eyebrow: text("Eyebrow"),
      heading: text("Heading"),
    })
    .meta({ label: "Client reviews", collapsed: true }),
  testimonialCards: z
    .array(
      z.object({
        quote: area("Quote"),
        name: text("Client name"),
        role: text("Role & company"),
      })
    )
    .meta({ label: "Client reviews — quotes" }),

  showCta: visibility("Show call to action band"),
  cta: z
    .object({
      heading: area("Heading"),
      body: area("Body"),
      secondaryLabel: text("Secondary button label"),
      secondaryHref: link("Secondary button destination"),
      // Added after first release: defaults let earlier content still publish.
      showImage: visibility("Show image").default(true),
      imagePadding: z
        .enum(["none", "padded"])
        .meta({ label: "Image padding (none = flush to the panel edge)" })
        .default("none"),
      imageUrl: image("Image").default(""),
      imageAlt: text("Image alt text").default(""),
    })
    .meta({ label: "Call to action band", collapsed: true }),

  showFaq: visibility("Show FAQ"),
  faq: z
    .object({
      heading: text("Heading"),
      body: area("Intro"),
    })
    .meta({ label: "FAQ", collapsed: true }),
  faqItems: z
    .array(
      z.object({
        question: text("Question"),
        answer: area("Answer"),
      })
    )
    .meta({ label: "FAQ — questions" }),

  showContact: visibility("Show contact"),
  contact: z
    .object({
      eyebrow: text("Eyebrow"),
      heading: text("Heading"),
      availability: text("Availability badge"),
    })
    .meta({ label: "Contact", collapsed: true }),
  contactDetails: z
    .array(
      z.object({
        label: text("Label"),
        value: text("Value"),
        href: link("Link (mailto:, tel: or URL — optional)"),
      })
    )
    .meta({ label: "Contact — details" }),

  footer: z
    .object({
      tagline: area("Tagline"),
      ctaEyebrow: text("Label above the button"),
      copyright: text("Copyright"),
    })
    .meta({ label: "Footer", collapsed: true }),
  socialLinks: z
    .array(
      z.object({
        label: text("Label"),
        href: link("URL (icon picked from the address)"),
      })
    )
    .meta({ label: "Footer — social links" }),
  legalLinks: z
    .array(
      z.object({
        label: text("Label"),
        href: link("URL"),
      })
    )
    .meta({ label: "Footer — legal links" }),
})

export type LumousStudioOneContent = z.infer<typeof contentSchema>

export const defaultContent: LumousStudioOneContent = {
  brandName: "Lumos Studio",
  bookingLabel: "Book a discovery call",
  bookingUrl: "https://cal.com/luma-studio/discovery-call",
  animations: true,

  hero: {
    headlineStart: "Your next chapter",
    headlineMiddle: "deserves a",
    pillWord: "better",
    headlineEnd: "website.",
    intro:
      "We create clear brands and thoughtful websites that help ambitious businesses stand out and grow. A website should do more than look good. It should explain what you do in seconds, feel unmistakably yours and make it easy for the right people to get in touch. That is what we design for, from the first conversation to launch day.",
    fallingIcons: "default",
  },

  showFeature: true,
  feature: {
    imageUrl:
      "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/hero.gif",
    imageAlt: "The Luma Studio team reviewing a brand identity",
  },

  showAbout: true,
  about: {
    eyebrow: "About Luma Studio",
    heading:
      "A small, senior team that designs like it's our own business on the line.",
  },
  aboutPillars: [
    {
      title: "Straight talking",
      body: "No jargon, no account managers in between. You work directly with the people designing your brand.",
    },
    {
      title: "Strategy first",
      body: "We start with your goals and your customers, then design around them. Every decision has a reason you can explain.",
    },
    {
      title: "Built to hand over",
      body: "Guidelines, templates and a site your team can update without calling us every time.",
    },
  ],

  showProcess: true,
  process: {
    heading: "How it works",
    body: "Four clear stages from first call to launch day, with fixed milestones so you always know what's next.",
  },
  processSteps: [
    {
      title: "Discovery",
      subtitle: "Understanding where you are and where you’re going",
      body: "A discovery call and workshop to understand your business, audience, competitors and goals. We agree what success looks like before any design begins.",
      timing: "Week 1",
    },
    {
      title: "Direction",
      subtitle: "One clear route before the detail",
      body: "We agree on positioning, key messages and a creative direction, so every design decision that follows has a reason behind it.",
      timing: "Weeks 2–3",
    },
    {
      title: "Design",
      subtitle: "Focused rounds, no surprises",
      body: "Identity, pages and components are designed in structured rounds with clear feedback points, keeping the project moving and your team involved.",
      timing: "Weeks 3–6",
    },
    {
      title: "Launch",
      subtitle: "Live, tested and in your hands",
      body: "We build, test and launch, then hand over guidelines, source files and training so your team can take it from there.",
      timing: "Weeks 6–8",
    },
  ],

  showServices: true,
  services: {
    eyebrow: "Services",
    heading: "Everything you need to look as good as you are.",
  },
  serviceCards: [
    {
      title: "Brand strategy",
      body: "Positioning, audience insight and key messages that give every page and pitch a clear point of view.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/brand_strategy.png",
      imageAlt: "A strategy workshop in progress",
    },
    {
      title: "Visual identity",
      body: "Logo, colour, type and a practical guidelines kit, so your brand looks consistent wherever it appears.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/visual_identity.png",
      imageAlt: "Pages from a brand identity system",
    },
    {
      title: "Website design",
      body: "Multi-page websites designed and built to explain your offer, earn trust and bring in enquiries.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/website_design.png",
      imageAlt: "A website design shown on a laptop",
    },
    {
      title: "Landing pages",
      body: "Focused campaign and launch pages, designed around a single action and ready in a matter of weeks.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/landing_page.png",
      imageAlt: "A campaign landing page on a phone",
    },
  ],

  showWork: true,
  work: {
    eyebrow: "Selected work",
    heading: "Recent projects.",
  },
  projects: [
    {
      title: "Bloom Finance",
      body: "Brand identity and marketing site for a personal finance app, built to make saving feel calm rather than complicated.",
      meta: "Finance app · Identity, website",
      href: "https://example.com/work/bloom-finance",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/recent_1.png",
      imageAlt: "Bloom Finance app screens and brand visuals",
    },
    {
      title: "Nestwell",
      body: "A refreshed identity and portfolio site for an interiors studio, letting the work breathe.",
      meta: "Interiors studio · Rebrand, website",
      href: "https://example.com/work/nestwell",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/recent_2.png",
      imageAlt: "The Nestwell interiors website",
    },
    {
      title: "Flux Analytics",
      body: "Messaging and a product website for a software company explaining a technical tool in plain language.",
      meta: "Software · Messaging, website",
      href: "https://example.com/work/flux-analytics",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/recent_3.png",
      imageAlt: "The Flux Analytics product website",
    },
  ],

  showAudiences: true,
  audiences: {
    heading: "Who we work with",
    body: "Luma is built for founders and small teams who need professional design without a complicated agency experience, from first launch to the next stage of growth.",
    showImages: true,
  },
  audienceCards: [
    {
      title: "Startups launching",
      tags: [
        "Brand identity",
        "Launch website",
        "Pitch-ready assets",
        "Naming support",
      ],
      body: "Go to market with a brand and website that make you look established from day one, and a system that grows with you.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/work_with_2.png",
      imageAlt:
        "Chrome compass star inside a ring with a lime centre and a lavender segment",
    },
    {
      title: "Service businesses",
      tags: ["Rebrand", "Website redesign", "Messaging"],
      body: "Your work has moved on and your website hasn’t. We bring your brand up to the standard of the service you deliver.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/work_with_1.png",
      imageAlt: "Chrome ribbons twisting around a glowing lime sphere",
    },
    {
      title: "Marketing teams",
      tags: ["Landing pages", "Campaign assets"],
      body: "Extra design capacity for launches and campaigns, with pages that stay on brand and ship on time.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/work_with_3.png",
      imageAlt: "Interlocking chrome, lime and lavender loops forming a knot",
    },
    {
      title: "Consultants and advisors",
      tags: ["Personal brand", "Credibility"],
      body: "Turn expertise into a clear, credible presence that helps the right clients find you and trust you quickly.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/work_with_4.png",
      imageAlt:
        "Chrome web page mockup with a lime arrow curving upwards around it",
    },
    {
      title: "Product-led companies",
      tags: ["Marketing site", "Design system"],
      body: "Explain a complex product in plain language with a site that turns visitors into sign-ups.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/work_with_5.png",
      imageAlt:
        "Chrome desktop monitor and phone showing the same lime and cream website",
    },
  ],

  showTestimonials: true,
  testimonials: {
    eyebrow: "Client reviews",
    heading: "What clients say.",
  },
  testimonialCards: [
    {
      quote:
        "“For the first time, our website explains what we do better than we can on a call. Enquiries picked up within the first month.”",
      name: "Sample client name",
      role: "Founder, finance startup",
    },
    {
      quote:
        "“Clear process, honest advice and no endless revision rounds. The team made a rebrand feel manageable.”",
      name: "Sample client name",
      role: "Director, interiors studio",
    },
    {
      quote:
        "“They felt like part of our marketing team. Our campaign pages shipped on time and finally looked like one brand.”",
      name: "Sample client name",
      role: "Head of marketing, software company",
    },
  ],

  showCta: true,
  cta: {
    heading: "Ready to start your next chapter?",
    body: "Book a free 30-minute discovery call. We'll talk through your goals and tell you honestly whether we're the right fit.",
    secondaryLabel: "Explore our work",
    secondaryHref: "#work",
    showImage: true,
    imagePadding: "none",
    imageUrl:
      "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-studio-one/ready_to_start.png",
    imageAlt: "Traffic light glowing green, signalling it's time to go",
  },

  showFaq: true,
  faq: {
    heading: "Questions we hear often.",
    body: "Something else on your mind? Ask us on a discovery call.",
  },
  faqItems: [
    {
      question: "What's included in a typical project?",
      answer:
        "Every project is scoped after the discovery call. A brand and website project usually covers strategy, identity, a guidelines kit and a five to eight page site. You'll get a written scope and fixed quote before we start.",
    },
    {
      question: "How long does it take?",
      answer:
        "Landing pages take two to three weeks. A full brand and website project usually takes six to eight weeks, depending on scope and how quickly feedback comes back.",
    },
    {
      question: "How will we work together?",
      answer:
        "You'll have a shared project board, a weekly check-in and direct access to your designers. We agree feedback points in advance, so you only review work when there's something meaningful to see.",
    },
    {
      question: "How much input do you need from us?",
      answer:
        "Most involvement happens early, in the discovery workshop. After that, plan for about an hour a week for reviews. We can write your website copy too, or refine what you already have.",
    },
    {
      question: "What happens at handover?",
      answer:
        "You own everything we make. We hand over source files, brand guidelines and website access, plus a recorded training session so your team can edit pages confidently.",
    },
    {
      question: "Do you offer support after launch?",
      answer:
        "Yes. Every website includes 30 days of support after launch. After that, many clients keep us on a flexible monthly plan for updates, new pages and campaign work.",
    },
  ],

  showContact: true,
  contact: {
    eyebrow: "Contact",
    heading: "Let's talk about your project.",
    availability: "Now booking projects from November 2026",
  },
  contactDetails: [
    {
      label: "Email",
      value: "hello@lumastudio.example",
      href: "mailto:hello@lumastudio.example",
    },
    {
      label: "Phone",
      value: "+44 (0)00 0000 0000",
      href: "tel:+440000000000",
    },
    {
      label: "Studio",
      value: "Remote-first, working with clients across the UK and Europe",
      href: "",
    },
    { label: "Hours", value: "Monday to Friday, 9:00–17:30", href: "" },
  ],

  footer: {
    tagline:
      "An independent branding and web design studio helping startups and growing service businesses build a clear, credible online presence. Brand strategy, visual identity, websites and landing pages, delivered without the complicated agency experience.",
    ctaEyebrow: "Start a project",
    copyright: "© 2026 Luma Studio. All rights reserved.",
  },
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Dribbble", href: "https://dribbble.com/" },
  ],
  legalLinks: [
    { label: "Privacy policy", href: "https://example.com/privacy" },
    { label: "Terms", href: "https://example.com/terms" },
  ],
}
