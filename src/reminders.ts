import chunk from 'chunk'
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
}

export const checkReminders: () => Promise<readonly Reminder[]> = async () => {
  const entries = await redis.xrange(STREAM_KEY, '-', '+')
  const rawReminders = entries.map(([key, rawValues]) => {
    const entries = [['id', key], ...chunk(rawValues, 2)]
    const values = Object.fromEntries(entries) as Record<string, unknown>

    return values
  })

  const now = Date.now()
  const mapped = rawReminders.map(entry => {
    const userID = entry[Field.UserID]
    const content = entry[Field.Content]
    const triggerAtRaw = entry[Field.TriggerAt]

    if (typeof entry.id !== 'string') return undefined
    if (typeof userID !== 'string') return undefined
    if (typeof content !== 'string') return undefined
    if (typeof triggerAtRaw !== 'string') return undefined

    const triggerTime = Number.parseInt(triggerAtRaw, 10)
    if (Number.isNaN(triggerTime)) return undefined
    const triggerAt = new Date(triggerTime)

    // Filter out invalid dates
    if (Number.isNaN(triggerAt.getTime())) return undefined
    // Filter out reminders before current time
    if (triggerAt.getTime() > now) return undefined

    const reminder: Reminder = {
      id: entry.id,
      userID,
      messageID: undefined,
      content,
    }

    return reminder
  })

  const filtered = mapped.filter((x): x is Reminder => x !== undefined)
  const jobs = filtered.map(async reminder => ({
    ...reminder,
    messageID: (await redis.hget(MESSAGES_KEY, reminder.id)) ?? undefined,
  }))

  return Promise.all(jobs)
}
