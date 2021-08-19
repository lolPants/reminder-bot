import { parse } from '@lolpants/timeparser'
import { DiscordAPIError } from 'discord.js'
import {
  addReminder,
  removeReminder,
  setReminderMessage,
} from '../reminders.js'
import type { CommandHandler } from './index.js'

const units = new Set([
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
])

export const remindme: CommandHandler = async ({
  message,
  content: messageContent,
}) => {
  const resolveArgs: () => [time: string, message: string] = () => {
    const [first, second, ...rest] = messageContent.split(' ')

    if (second !== undefined) {
      const lower = second.toLowerCase()
      const unitCheck = lower.endsWith('s') ? lower.slice(0, -1) : lower

      if (units.has(unitCheck)) {
        const time = [first, second].join(' ')
        const content = rest.join(' ')

        return [time, content]
      }
    }

    const content = [second, ...rest].join(' ')
    return [first, content]
  }

  const [rawTime, rawContent] = resolveArgs()
  const time = parse(rawTime)
  const content = rawContent === '' ? '*No message given.*' : rawContent

  if (time === undefined) {
    await message.reply(`Invalid time string \`${rawTime}\``)
    return
  }

  const triggerAt = new Date(Date.now() + time)
  const id = await addReminder(message.author, content, triggerAt)

  try {
    // TODO
    const reminderMessage = await message.author.send({
      content: `reminder ID: \`${id}\``,
    })

    await setReminderMessage(id, reminderMessage)
  } catch (error: unknown) {
    if (error instanceof DiscordAPIError && error.code === 50_007) {
      await removeReminder(id)
      await message.reply(
        'Unable to record reminder as your privacy settings prevent me from sending direct messages to you.\n' +
          "Please keep them open else I won't be able to send the reminder either!"
      )

      return
    }

    throw error
  }
}
