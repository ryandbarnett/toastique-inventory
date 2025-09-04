// server.js
import 'dotenv/config'
import express from 'express'
import { initDb, seedDb } from './lib/db/index.js'
import { makeJuicesRepo } from './lib/repo/juices.js'
import { makeUserRepo } from './lib/repo/users.mjs'
import { installAuth } from './packages/auth/src/index.mjs'
import { makeErrorHandler, notFound } from './lib/http/errors.mjs'
import { loadConfig } from './lib/config.mjs'
import { makeJuicesRouter, makeHealthRouter } from './lib/http/routes'

/**
 * @param {{ dbPath?: string, seed?: boolean }} opts
 */
export function createApp({ dbPath = 'db.sqlite', seed = false, authSecurity } = {}) {
  const app = express()
  app.use(express.json())
  app.use(express.static('public'))

  // ★ Behind Render's HTTPS proxy: make req.secure true so Secure cookies can be set
  app.set('trust proxy', 1)

  const db = initDb(dbPath)
  if (seed) seedDb(db)

  const juices = makeJuicesRepo(db)
  const users  = makeUserRepo(db)

  // --- Auth: one-liner bootstrap
  const { requireAuth: authRequired } = installAuth(app, {
    userRepo: users,
    env: process.env,
    security: authSecurity, // allow test override from tests/helpers
  })

  // Mount routers
  // NEW (v1)
  app.use('/api/v1/juices', makeJuicesRouter({
    juicesRepo: juices,
    usersRepo: users,
    requireAuth: authRequired,
  }))

  app.use('/api/v1', makeHealthRouter())

  app.use('/api/v1', (_req, res) => notFound(res, 'API route not found'))

  app.use(makeErrorHandler())

  return app
}

/* c8 ignore start */
// Start the server only when this file is run directly (not when imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig(process.env)
  console.log('ENV → DB_PATH:', process.env.DB_PATH || '(unset)')
  console.log('Using DB path:', config.dbPath)
  console.log('ENV → SEED:', config.seed)
  console.log('ENV → NODE_ENV:', config.nodeEnv)

  const app = createApp({ dbPath: config.dbPath, seed: config.seed })
  app.listen(config.port, () => {
    console.log(`🚀 Server listening on http://localhost:${config.port}`)
  })
}
