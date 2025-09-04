// lib/config.mjs

/**
 * Normalize process.env into a typed config object.
 */
export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3000,
    dbPath: env.DB_PATH || '/var/data/db.sqlite',
    seed: String(env.SEED).toLowerCase() === 'true',
    nodeEnv: env.NODE_ENV || 'development',
  }
}
