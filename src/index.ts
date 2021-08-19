import 'source-map-support/register.js'

import { field } from '@lolpants/jogger'
import { Client, Intents } from 'discord.js'
import type { CommandParameters } from './commands/index.js'
import { remindme } from './commands/remindme.js'
import { PREFIX, TOKEN } from './env/index.js'
import { exitHook } from './exit.js'
import { parseInteractionID } from './interactions/index.js'
import type { ButtonParameters } from './interactions/index.js'
import { errorField, flush, logger } from './logger.js'
import { awaitRedis } from './redis/index.js'

const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
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
    case 'remindme':
    case 'reminder':
    case 'addreminder':
      await remindme(parameters)
      break

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

client.on('interactionCreate', async button => {
  if (!button.isButton()) return

  const interaction = parseInteractionID(button.customId)
  const { key, components } = interaction

  const parameters: ButtonParameters = {
    button,
    client,
    key,
    components,
  }

  switch (key) {
    default: {
      logger.error(
        field('event', 'interactionCreate'),
        field('interaction', interaction.key),
        field('error', 'unhandled interaction')
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

void awaitRedis().then(async () => client.login(TOKEN))
