import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
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
