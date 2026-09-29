import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const engineRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: { root: engineRoot },
  images: {
    formats: ["image/avif", "image/webp"],
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
