import type { Client, Message } from 'discord.js'

export interface CommandParameters {
  message: Message
  content: string
  client: Client
}
