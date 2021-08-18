import 'source-map-support/register.js'

import { field } from '@lolpants/jogger'
import { Client, Intents } from 'discord.js'
import type { CommandParameters } from './commands/index.js'
import { PREFIX, TOKEN } from './env/index.js'
import { exitHook } from './exit.js'
import { errorField, flush, logger } from './logger.js'

const client = new Client({
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
})

client.on('ready', () => {
  logger.info(
    field('action', 'ready'),
    field('user', client.user?.tag ?? 'Unknown')
  )
})

client.on('messageCreate', async message => {
  if (message.author.bot) return

  if (!message.content.toLowerCase().startsWith(PREFIX)) return
  const [command, ...contentArray] = message.content
    .slice(PREFIX.length)
    .split(' ')

  if (command === '') return
  const content = contentArray.join(' ')

  const parameters: CommandParameters = {
    message,
    content,
    client,
  }

  switch (command.toLowerCase()) {
    default: {
      logger.debug(
        field('event', 'messageCreate'),
        field('command', command.toLowerCase()),
        field('error', 'unhandled command')
      )

      break
    }
  }
})

exitHook(async (exit, error) => {
  client.destroy()

  if (error) {
    logger.error(errorField(error))
  } else {
    logger.info(field('action', 'shutdown'))
  }

  await flush()
  exit()
})

void client.login(TOKEN)
