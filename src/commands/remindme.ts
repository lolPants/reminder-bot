import { parse } from '@lolpants/timeparser'
import { DiscordAPIError, MessageActionRow, MessageButton } from 'discord.js'
import { interactionID } from '../interactions/index.js'
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
    const cancelButton = new MessageButton()
      .setLabel('Cancel')
      .setCustomId(interactionID('reminder', 'cancel', id))
      .setStyle('DANGER')

    const buttons = new MessageActionRow().addComponents(cancelButton)

    const reminderMessage = await message.author.send({
      content: `reminder ID: \`${id}\``,
      components: [buttons],
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
