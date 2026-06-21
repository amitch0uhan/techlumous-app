/**
 * Editable content for the Hello World template.
 *
 * This is the contract the studio editor will use to render an input form.
 * Kept as a plain type + defaults for now; a Zod schema can replace it later
 * without changing the renderer or build pipeline.
 */
export interface HelloWorldContent {
  message: string
}

export const defaultContent: HelloWorldContent = {
  message: "Hello World",
}
