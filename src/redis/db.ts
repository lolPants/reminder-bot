import { field } from '@lolpants/jogger'
import Redis from 'ioredis'
import process from 'node:process'
import {
  REDIS_DB_BASE,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
  REDIS_URL,
} from '../env/index.js'
import { ctxField, logger } from '../logger.js'

const ctx = ctxField('redis')

const createRedis = () => {
  if (REDIS_URL !== undefined) {
    const redis = new Redis(REDIS_URL)
    return redis
  }

  return new Redis({
    db: REDIS_DB_BASE + 0,
    host: REDIS_HOST,
    password: REDIS_PASS,
    port: REDIS_PORT,
  })
}

export const redis = createRedis()
redis.on('error', () => {
  logger.error(ctx, field('message', 'Failed to connect to Redis!'))
  process.exit(1)
})

redis.on('ready', () => {
  logger.info(ctx, field('message', 'Connected to Redis!'))
})
