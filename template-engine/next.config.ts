import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const engineRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: { root: engineRoot },
  images: {
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
