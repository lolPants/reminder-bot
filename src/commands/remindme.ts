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

export const remindme: CommandHandler = async ({ content: messageContent }) => {
  const resolveArgs: () => [time: string, message: string] = () => {
    const [first, second, ...rest] = messageContent.split(' ')

    const lower = second.toLowerCase()
    const unitCheck = lower.endsWith('s') ? lower.slice(0, -1) : lower

    if (units.has(unitCheck)) {
      const time = [first, second].join(' ')
      const content = rest.join(' ')

      return [time, content]
    }

    const content = [second, ...rest].join(' ')
    return [first, content]
  }

  const [time, content] = resolveArgs()
  // TODO
}
