import "server-only"

import { cacheLife } from "next/cache"
import sharp from "sharp"

// Throws on failure so only successful results are cached; errors aren't.
async function generateBlurDataURL(url: string): Promise<string> {
  "use cache"
  cacheLife("days")

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const preview = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize(10, 10, { fit: "inside" })
    .png()
    .toBuffer()

  return `data:image/png;base64,${preview.toString("base64")}`
}

export async function getBlurDataURL(url: string): Promise<string> {
  try {
    return await generateBlurDataURL(url)
  } catch {
    return ""
  }
}
