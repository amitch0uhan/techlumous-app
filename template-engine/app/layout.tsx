import type { ReactNode } from "react"

import "./globals.css"

/**
 * Minimal shell. `globals.css` is only a tiny reset — each template owns its
 * entire style (its own Tailwind entry, `@theme` tokens, keyframes, and fonts)
 * inside its own folder, so nothing template-specific lives in the engine.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
