import type { Client, Message } from 'discord.js'

export type CommandHandler = (
  parameters: CommandParameters
) => void | Promise<void>

export interface CommandParameters {
  message: Message
  content: string
  client: Client
}
