"use client"

import { LumousTravelOneContent } from "./schema"

export function Template({ content }: { content: LumousTravelOneContent }) {
  return (
    <div>
      <h1>{content.title}</h1>
    </div>
  )
}
