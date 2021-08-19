import type { Message, User } from 'discord.js'
import { redis } from './redis/index.js'

const KEY = 'reminder-bot'
const STREAM_KEY = `${KEY}:reminders`
const MESSAGES_KEY = `${KEY}:messages`

const enum Field {
  UserID = 'userID',
  Content = 'content',
  TriggerAt = 'triggerAt',
}

export const addReminder: (
  user: User,
  content: string,
  triggerAt: Date
) => Promise<string> = async (user, content, triggerAt) => {
  const id = await redis.xadd(
    STREAM_KEY,
    '*',
    Field.UserID,
    user.id,
    Field.Content,
    content,
    Field.TriggerAt,
    triggerAt.getTime()
  )

  return id
}

export const setReminderMessage: (
  id: string,
  message: Message
) => Promise<void> = async (id, message) => {
  await redis.hset(MESSAGES_KEY, id, message.id)
}

export const removeReminder: (id: string) => Promise<boolean> = async id => {
  await redis.hdel(MESSAGES_KEY, id)
  const count = await redis.xdel(STREAM_KEY, id)

  return count !== 0
}

interface Reminder {
  id: string
  userID: string
  messageID: string | undefined
  content: string
  triggerAt: Date
}

export const checkReminders: () => Promise<readonly Reminder[]> = async () => {
  const entries = await redis.xrange(STREAM_KEY, '-', '+')
  console.log(entries)

  // TODO
  throw new Error('not implemented')
}
