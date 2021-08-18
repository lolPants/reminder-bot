import 'source-map-support/register.js'

import { Client, Intents } from 'discord.js'
import { TOKEN } from './env/index.js'
import { exitHook } from './exit.js'

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
})

exitHook(async exit => {
  client.destroy()
  exit()
})

void client.login(TOKEN)
