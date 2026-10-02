import { Suspense, type ReactNode } from "react"

/** Public: renders only a template's static defaults, so no login is needed. */
export default function RenderLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}
