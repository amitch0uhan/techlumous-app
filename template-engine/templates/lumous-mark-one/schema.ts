export interface LumousNavLink {
  label: string
  href: string
}

export interface LumousFeatureMeta {
  label: string
  value: string
}

export interface LumousFeature {
  title: string
  body: string
  meta: LumousFeatureMeta[]
}

export interface LumousFooterLink {
  label: string
  href: string
}

export interface LumousFooterColumn {
  title: string
  items: LumousFooterLink[]
}

/** Hero badge sub-labels — up to 3 short strings, rendered joined by "·". */
export type LumousBadgeMeta =
  | [string]
  | [string, string]
  | [string, string, string]

export interface LumousMarkOneContent {
  brand: string
  nav: LumousNavLink[]
  hero: {
    eyebrow: string
    headlineTop: string
    headlineMid: string
    headlineHighlight: string
    headlineEnd: string
    badgeText: string
    badgeMeta: LumousBadgeMeta
  }
  features: {
    eyebrow: string
    items: LumousFeature[]
  }
  about: {
    eyebrow: string
    statement: string
    statementMuted: string
    imageUrl: string
    imageAlt: string
  }
  contact: {
    eyebrow: string
    headline: string
    href: string
    contactLine: string
  }
  footer: {
    wordmark: string
    columns: LumousFooterColumn[]
    copyright: string
    tagline: string
  }
}

export const defaultContent: LumousMarkOneContent = {
  brand: "Lumous Mark",
  nav: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
  hero: {
    eyebrow: "Independent design studio — Est. 2016",
    headlineTop: "We build products",
    headlineMid: "that",
    headlineHighlight: "move",
    headlineEnd: "markets",
    badgeText: "Trusted by 2k+ product teams",
    badgeMeta: ["Strategy", "Design", "Engineering"],
  },
  features: {
    eyebrow: "What we do — 04 disciplines",
    items: [
      {
        title: "Brand Strategy",
        body: "We shape the story, positioning, and identity that make a product impossible to ignore — grounded in research, sharpened by taste.",
        meta: [
          { label: "Based in", value: "Remote — global" },
          { label: "Experience", value: "8+ yrs" },
        ],
      },
      {
        title: "Growth Marketing",
        body: "Full-funnel systems that turn attention into revenue — content, performance, and lifecycle engineered to compound.",
        meta: [
          { label: "Channels", value: "Owned + paid" },
          { label: "Focus", value: "Revenue, not vanity" },
        ],
      },
      {
        title: "Product Design",
        body: "Interfaces people feel before they understand — clarity, motion, and craft applied end to end across the experience.",
        meta: [
          { label: "Method", value: "Ship, learn, refine" },
          { label: "Tooling", value: "Design + code" },
        ],
      },
      {
        title: "Web Development",
        body: "Fast, resilient, accessible builds — hand-tuned front-end and pragmatic infrastructure that scales quietly in the background.",
        meta: [
          { label: "Stack", value: "Modern, boring, fast" },
          { label: "Perf", value: "100 Lighthouse" },
        ],
      },
    ],
  },
  about: {
    eyebrow: "Why teams choose us",
    statement:
      "We embed with founders and product leaders to turn ambitious ideas into shipped, category-defining products —",
    statementMuted:
      "from the first pixel to the launch that moves the number that matters.",
    imageUrl:
      "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/Techlumous%20Template/lumous-mark-one-image-1.jpg",
    imageAlt: "Studio at work",
  },
  contact: {
    eyebrow: "Have a project in mind?",
    headline: "Contact us",
    href: "#",
    contactLine: "hello@form.studio · +1 (415) 555-0148",
  },
  footer: {
    wordmark: "www.form.studio",
    columns: [
      {
        title: "What we do",
        items: [
          { label: "Brand Strategy", href: "#" },
          { label: "Growth Marketing", href: "#" },
          { label: "Product Design", href: "#" },
          { label: "Web Development", href: "#" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Case studies", href: "#" },
          { label: "Journal", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Contact", href: "#" },
        ],
      },
      {
        title: "Address",
        items: [
          { label: "Remote — worldwide", href: "#" },
          { label: "hello@form.studio", href: "mailto:hello@form.studio" },
          { label: "+1 (415) 555-0148", href: "tel:+14155550148" },
        ],
      },
      {
        title: "Social",
        items: [
          { label: "Instagram", href: "#" },
          { label: "Dribbble", href: "#" },
          { label: "LinkedIn", href: "#" },
          { label: "X / Twitter", href: "#" },
        ],
      },
    ],
    copyright: "© 2026 Lumous Mark One — All rights reserved",
    tagline: "Made with intent, not templates",
  },
}
