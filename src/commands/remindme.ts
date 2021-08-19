import { parse } from '@lolpants/timeparser'
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

  // TODO
  console.log({ time, content })
}
