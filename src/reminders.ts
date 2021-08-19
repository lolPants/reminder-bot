import type { Message } from 'discord.js'
import { redis } from './redis/index.js'

const STREAM_KEY = 'reminders'
const enum Field {
  UserID = 'userID',
  MessageID = 'messageID',
  Content = 'content',
  TriggerAt = 'triggerAt',
}

export const addReminder: (
  message: Message,
  content: string,
  triggerAt: Date
) => Promise<string> = async (message, content, triggerAt) => {
  const id = await redis.xadd(
    STREAM_KEY,
    '*',
    Field.UserID,
    message.author.id,
    Field.MessageID,
    message.id,
    Field.Content,
    content,
    Field.TriggerAt,
    triggerAt.getTime()
  )

  return id
}

interface Reminder {
  userID: string
  messageID: string
  content: string
  triggerAt: Date
}

export const checkReminders: () => Promise<readonly Reminder[]> = async () => {
  const entries = await redis.xrange(STREAM_KEY, '-', '+')
  console.log(entries)

  // TODO
  throw new Error('not implemented')
}
