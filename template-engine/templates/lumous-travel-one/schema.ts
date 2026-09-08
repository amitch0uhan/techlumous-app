import { z } from "zod"

import { area, color, image, link, text, visibility } from "@/templates/fields"

// Source of truth for the content type (z.infer) and the studio edit form.
// Field builders come from the shared `templates/fields.ts`; `.meta()` picks the
// widget. Headlines take *asterisk* pairs for emphasis.

// Role-named palette, shared by the per-field defaults and defaultContent.colors.
// White/black roles are only ever painted through an opacity modifier or color-mix.
const DEFAULT_COLORS = {
  canvas: "#07080A",
  navSurface: "#0F0F12",
  cardSurface: "#131317",
  panelSurface: "#1C1C22",
  accentPrimary: "#3AAE7E",
  accentSecondary: "#1F6B4E",
  accentForeground: "#06120D",
  textStrong: "#FFFFFF",
  textBody: "#E8E6DF",
  textMuted: "#B4B1A7",
  textSubtle: "#807D75",
  sectionText: "#FFFFFF",
  onImage: "#FFFFFF",
  onLight: "#0A0A0B",
  border: "#FFFFFF",
  scrim: "#07080A",
  shadow: "#000000",
} as const

export const contentSchema = z.object({
  // colours
  colors: z
    .object({
      canvas: color("Page background", DEFAULT_COLORS.canvas),
      navSurface: color("Nav bar background", DEFAULT_COLORS.navSurface),
      cardSurface: color("Card background", DEFAULT_COLORS.cardSurface),
      panelSurface: color("Section panel base", DEFAULT_COLORS.panelSurface),

      accentPrimary: color("Primary accent", DEFAULT_COLORS.accentPrimary),
      accentSecondary: color(
        "Secondary accent",
        DEFAULT_COLORS.accentSecondary
      ),
      accentForeground: color(
        "Text on accent",
        DEFAULT_COLORS.accentForeground
      ),

      textStrong: color("Heading text", DEFAULT_COLORS.textStrong),
      textBody: color("Body text", DEFAULT_COLORS.textBody),
      textMuted: color("Muted text", DEFAULT_COLORS.textMuted),
      textSubtle: color("Subtle label text", DEFAULT_COLORS.textSubtle),
      sectionText: color("Section text", DEFAULT_COLORS.sectionText),

      onImage: color("Text & controls over images", DEFAULT_COLORS.onImage),
      onLight: color("Text on light buttons", DEFAULT_COLORS.onLight),

      border: color("Borders & dividers", DEFAULT_COLORS.border),
      scrim: color("Image overlay", DEFAULT_COLORS.scrim),
      shadow: color("Shadow", DEFAULT_COLORS.shadow),
    })
    // `.prefault({})` re-parses so the leaf defaults fill a missing group.
    .meta({ label: "Colours", collapsed: true })
    .prefault({}),

  brandName: text("Brand name"),
  logoUrl: image("Logo"),

  // nav
  showNav: visibility("Show navigation"),
  navCtaLabel: text("Nav CTA label"),
  navCtaHref: link("Nav CTA destination"),

  // hero
  showHero: visibility("Show hero"),
  heroHeadline: area("Hero headline"),
  heroImageUrl: image("Hero background"),
  heroImageAlt: text("Hero background alt text"),
  heroTags: z.array(z.string()).meta({ label: "Hero tags" }),
  heroCards: z
    .array(
      z.object({
        title: text("Title"),
        meta: text("Nights and price"),
        imageUrl: image("Image"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Hero trip cards" }),

  // about
  showAbout: visibility("Show about"),
  aboutEyebrow: text("About eyebrow"),
  aboutIntro: area("About intro"),
  aboutHeadline: area("About headline"),
  aboutCtaLabel: text("About CTA label"),
  aboutCtaHref: link("About CTA destination"),

  // destinations
  showDestinations: visibility("Show popular destinations"),
  destinationsEyebrow: text("Destinations eyebrow"),
  destinationsHeadline: area("Destinations headline"),
  destinations: z
    .array(
      z.object({
        region: text("Region label"),
        title: text("Title"),
        body: area("Body"),
        imageUrl: image("Image"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Destinations" }),

  // testimonials
  showTestimonials: visibility("Show testimonials"),
  testimonialsEyebrow: text("Testimonials eyebrow"),
  testimonialsHeadline: area("Testimonials headline"),
  testimonialsNote: area("Testimonials note"),
  testimonials: z
    .array(
      z.object({
        quote: area("Quote"),
        name: text("Name"),
        trip: text("Trip"),
        avatarUrl: image("Avatar"),
      })
    )
    .meta({ label: "Testimonials" }),

  // why us
  showWhyUs: visibility("Show why choose us"),
  whyEyebrow: text("Why-us eyebrow"),
  whyHeadline: area("Why-us headline"),
  whyItems: z
    .array(
      z.object({
        title: text("Title"),
        body: area("Body"),
      })
    )
    .meta({ label: "Why-us points" }),

  // packages
  showPackages: visibility("Show packages we offer"),
  packagesEyebrow: text("Packages eyebrow"),
  packagesHeadline: area("Packages headline"),
  packagesNote: area("Packages note"),
  packagesCtaLabel: text("Packages CTA label"),
  packagesCtaHref: link("Packages CTA destination"),
  packagesDetailsLabel: text("Package details button label"),
  packages: z
    .array(
      z.object({
        title: text("Title"),
        body: area("Body"),
        price: text("Price"),
        tags: z.array(z.string()).meta({ label: "Tags" }),
        imageUrl: image("Image"),
        imageAlt: text("Image alt text"),
      })
    )
    .meta({ label: "Packages" }),

  // contact
  showContact: visibility("Show contact"),
  contactEyebrow: text("Contact eyebrow"),
  contactHeadline: area("Contact headline"),
  contactCtaLabel: text("Contact CTA label"),
  contactCtaHref: link("Contact CTA destination"),
  contactStudioLabel: text("Studio label"),
  contactStudioLines: z.array(z.string()).meta({ label: "Studio address" }),
  contactReachLabel: text("Reach-us label"),
  contactReachLines: z.array(z.string()).meta({ label: "Reach-us details" }),

  // footer
  showFooter: visibility("Show footer"),
  footerLinks: z
    .array(
      z.object({
        label: text("Label"),
        href: link("URL"),
      })
    )
    .meta({ label: "Footer links" }),
  footerCopyright: text("Copyright"),
})

export type LumousTravelOneContent = z.infer<typeof contentSchema>

export const defaultContent: LumousTravelOneContent = {
  colors: { ...DEFAULT_COLORS },

  brandName: "Lumous Travel One",
  logoUrl: "",

  showNav: true,
  navCtaLabel: "Plan my trip",
  navCtaHref: "#contact",

  showHero: true,
  heroHeadline: "Crafted journeys to the places that stay with you",
  heroImageUrl:
    "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/hero-lodge.png",
  heroImageAlt: "A lodge at dusk beneath the mountains",
  heroTags: ["Mountains", "Wilderness", "Cities", "Coast", "Rivers"],
  heroCards: [
    {
      title: "A lodge in the Dolomites",
      meta: "8 nights · from $3,900",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/dolomites.png",
      imageAlt: "A lodge in the Dolomites",
    },
    {
      title: "Patagonia end to end",
      meta: "11 nights · from $4,600",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/patagonia.png",
      imageAlt: "Patagonia end to end",
    },
    {
      title: "Kyoto, out of season",
      meta: "6 nights · from $2,780",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/kyoto.png",
      imageAlt: "Kyoto, out of season",
    },
  ],

  showAbout: true,
  aboutEyebrow: "About us",
  aboutIntro:
    "Lumous Travel One is a small planning studio. We build private and small-group itineraries, hold the bookings, and stay reachable for the whole trip.",
  aboutHeadline:
    "*Travel planned* by people who have been there, priced *without the guesswork* and looked after *door to door*",
  aboutCtaLabel: "Learn more",
  aboutCtaHref: "#destinations",

  showDestinations: true,
  destinationsEyebrow: "Popular destinations",
  destinationsHeadline: "Where our travellers are going this season",
  destinations: [
    {
      region: "Mountains",
      title: "Italy — Dolomites",
      body: "Hut to hut above Cortina, with the lit valley to come down to at the end of the week.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/dolomites.png",
      imageAlt: "Dolomites, Italy",
    },
    {
      region: "Wilderness",
      title: "Chile — Patagonia",
      body: "Torres del Paine to El Chaltén, timed for the long light and the shoulder-season crowds.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/patagonia.png",
      imageAlt: "Patagonia, Chile",
    },
    {
      region: "Cities",
      title: "Japan — Kyoto and Nara",
      body: "Rail between the two, ryokan nights, and temples before the coaches arrive.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/kyoto.png",
      imageAlt: "Kyoto, Japan",
    },
    {
      region: "Coast",
      title: "Italy — Amalfi and Cilento",
      body: "The coast road in shoulder season, with three nights south where it empties out.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/coast.png",
      imageAlt: "Amalfi coast, Italy",
    },
    {
      region: "Rivers",
      title: "Central Europe — river cities",
      body: "Prague, Meissen and Dresden by river and rail, all of it walkable after dark.",
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/city.png",
      imageAlt: "River cities, central Europe",
    },
  ],

  showTestimonials: true,
  testimonialsEyebrow: "Testimonials",
  testimonialsHeadline: "What travellers say *after they land*",
  testimonialsNote:
    "Nine in ten of our trips come from a past traveller or someone they sent to us.",
  testimonials: [
    {
      quote:
        "Two weeks in Japan with a five year old and not one wasted afternoon. The train notes alone were worth the fee.",
      name: "Anika Rasheed",
      trip: "Kyoto · Nara · Kanazawa",
      avatarUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/travelers.png",
    },
    {
      quote:
        "Our flight out of Punta Arenas was cancelled at midnight. Rebooked and a room held before we reached the desk.",
      name: "Tomás Oliveira",
      trip: "Chile · Torres del Paine",
      avatarUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/travelers.png",
    },
    {
      quote:
        "They talked us out of two hotels we had our hearts set on. They were right about both.",
      name: "Priya and Sam Whitfield",
      trip: "Italy · Dolomites",
      avatarUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/travelers.png",
    },
  ],

  showWhyUs: true,
  whyEyebrow: "Why choose us",
  whyHeadline: "*Four things* we hold to on every trip we plan",
  whyItems: [
    {
      title: "Stays we have slept in",
      body: "Every hotel, lodge and guesthouse on our lists has been visited by someone on the team. If a room faces the road or the pool closes in March, we tell you before you book.",
    },
    {
      title: "One planner, start to finish",
      body: "You work with the same person from the first call to the last transfer. No handovers, no repeating yourself to a booking desk.",
    },
    {
      title: "Reachable while you travel",
      body: "A direct line to your planner and a local contact in each city, answered around the clock for the length of your itinerary.",
    },
    {
      title: "Itemised, fixed pricing",
      body: "One quote, broken down line by line, with our planning fee shown separately. It does not move after you sign.",
    },
  ],

  showPackages: true,
  packagesEyebrow: "Packages we offer",
  packagesHeadline: "*Five routes* ready to book, or the frame for *your own*",
  packagesNote:
    "Prices are per person, twin share, including stays, transfers, guides and our planning fee. Flights quoted separately.",
  packagesCtaLabel: "See all packages",
  packagesCtaHref: "#contact",
  packagesDetailsLabel: "More details",
  packages: [
    {
      title: "Dolomite huts and dark skies",
      body: "Rifugio to rifugio above Cortina, with a private guide for the via ferrata days and two nights down in the valley.",
      price: "FROM $3,900",
      tags: ["9 nights", "Small group", "Max 8"],
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/dolomites.png",
      imageAlt: "Dolomite huts and dark skies",
    },
    {
      title: "Kyoto, out of season",
      body: "Six nights in the quiet months, with rail passes, two ryokan and a morning at the fish market.",
      price: "FROM $2,780",
      tags: ["6 nights", "Private", "Rail included"],
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/kyoto.png",
      imageAlt: "Kyoto, out of season",
    },
    {
      title: "Patagonia end to end",
      body: "Eleven nights from Torres del Paine to El Chaltén, with transfers, park permits and a guide on the long days.",
      price: "FROM $4,600",
      tags: ["11 nights", "Small group", "Max 8"],
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/patagonia.png",
      imageAlt: "Patagonia end to end",
    },
    {
      title: "The Amalfi coast road",
      body: "Nine nights between Positano and Cilento, with a car for the coast road and a boat day off Capri.",
      price: "FROM $3,250",
      tags: ["9 nights", "Self-drive", "Boat day"],
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/coast.png",
      imageAlt: "The Amalfi coast road",
    },
    {
      title: "River cities by rail",
      body: "Prague, Dresden and Meissen in ten nights, all by train, each of them walkable after dark.",
      price: "FROM $2,540",
      tags: ["10 nights", "Rail only", "City stays"],
      imageUrl:
        "https://jspqdyqdbczgwyorxcvi.supabase.co/storage/v1/object/public/techlumous/templates/lumous-travel-one/city.png",
      imageAlt: "River cities by rail",
    },
  ],

  showContact: true,
  contactEyebrow: "Contact us",
  contactHeadline: "Let's plan your next journey",
  contactCtaLabel: "Let's talk",
  contactCtaHref: "mailto:hello@lumoustravel.one",
  contactStudioLabel: "Studio",
  contactStudioLines: ["18 Harbour Lane", "Wellington 6011", "New Zealand"],
  contactReachLabel: "Reach us",
  contactReachLines: [
    "hello@lumoustravel.one",
    "+64 4 555 0180",
    "Mon–Sat, 9–7 NZST",
  ],

  showFooter: true,
  footerLinks: [
    { label: "About", href: "#about" },
    { label: "Destinations", href: "#destinations" },
    { label: "Packages", href: "#packages" },
    { label: "Contact", href: "#contact" },
  ],
  footerCopyright: "© 2026 Lumous Travel One",
}
