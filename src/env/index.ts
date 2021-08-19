/* eslint-disable prettier/prettier */
import { registerInt, registerString } from './register.js'

// #region Globals
const NODE_ENV = registerString('NODE_ENV')
const IS_PROD = NODE_ENV?.toLowerCase() === 'production'
export const IS_DEV = !IS_PROD
// #endregion

// #region Bot
export const TOKEN = registerString('TOKEN', true)
export const PREFIX = registerString('PREFIX') ?? '!'
// #endregion

// #region Redis
export const REDIS_URL = registerString('REDIS_URL')
export const REDIS_HOST = registerString('REDIS_HOST') ?? (IS_DEV ? 'localhost' : 'redis')
export const REDIS_PORT = registerInt('REDIS_PORT') ?? 6379
export const REDIS_PASS = registerString('REDIS_PASS')
export const REDIS_DB_BASE = registerInt('REDIS_DB_BASE') ?? 0
// #endregion
