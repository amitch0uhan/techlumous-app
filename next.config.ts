import type { NextConfig } from "next"

// 'self' framing keeps the editor's same-origin /render/[slug] preview iframe working.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    // Production only, so local development is unaffected.
    if (process.env.NODE_ENV !== "production") return []

    return [{ source: "/:path*", headers: securityHeaders }]
  },
  experimental: {
    serverActions: {
      // The Storage bucket accepts 5 MB images; allow multipart overhead too.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // AVIF first (smallest), WebP fallback; browsers without either get the source format.
    formats: ["image/avif", "image/webp"],
    // Required allowlist since Next.js 16: any `quality` prop must appear here.
    // 90 is reserved for the login hero, whose fine dot texture softens at 75.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jspqdyqdbczgwyorxcvi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
