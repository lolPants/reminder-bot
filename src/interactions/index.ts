import type { ButtonInteraction, Client } from 'discord.js'

export const interactionID: (
  context: string,
  id: string,
  ...components: string[]
) => string = (context, id, ...components) => {
  const start = `${context}@${id}`
  if (components.length === 0) return start

  const joined = components.join('/')
  return `${start}/${joined}`
}

interface ParsedInteraction {
  context: string
  id: string
  key: string
  components: string[]
}

export const parseInteractionID: (id: string) => ParsedInteraction = rawID => {
  const [key, ...components] = rawID.split('/')
  const [context, id] = key.split('@')

  return { context, id, key, components }
}

export type ButtonHandler = (
  parameters: ButtonParameters
) => void | Promise<void>

export interface ButtonParameters {
  button: ButtonInteraction
  client: Client

  key: ParsedInteraction['key']
  components: ParsedInteraction['components']
}
