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
  output: "standalone",
  async headers() {
    // Production only, so local development is unaffected.
    if (process.env.NODE_ENV !== "production") return []

    return [{ source: "/:path*", headers: securityHeaders }]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME ?? "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
