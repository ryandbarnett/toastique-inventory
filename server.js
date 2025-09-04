// server.js
import 'dotenv/config'
import express from 'express'
import { initDb, seedDb } from './lib/db/index.js'
import { makeJuicesRepo } from './lib/repo/juices.js'
import { listJuices, updateJuiceLiters } from './lib/service/juices.js'
import { makeUserRepo } from './lib/repo/users.mjs'
import { installAuth } from './packages/auth/src/index.mjs'
import { makeErrorHandler } from './lib/http/errors.mjs'

/**
 * @param {{ dbPath?: string, seed?: boolean }} opts
 */
export function createApp({ dbPath = 'db.sqlite', seed = false } = {}) {
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
  const { requireAuth: authRequired } = installAuth(app, { userRepo: users, env: process.env })

  // GET /api/juices  (?sort=name|status&dir=asc|desc)
  app.get('/api/juices', (req, res, next) => {
    try {
      const sort = req.query.sort
      const dir  = req.query.dir
      res.json(listJuices({ repo: juices, sort, dir }))
    } catch (err) { next(err) }
  })

  // PUT /api/juices/:id/liters (protected)
  app.put('/api/juices/:id/liters', authRequired, (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const liters = req.body?.liters
      const userId = req.session.userId
      const result = updateJuiceLiters({ repo: juices, users, id, liters, userId })
      if (result?.ok) {
        return res.json(result.body)
      }
      if (result?.error) {
        return res.status(result.error).json(result.body)
      }
      throw new Error('Unexpected updateJuiceLiters result')
    } catch (err) { next(err) }
  })

  app.use(makeErrorHandler())

  return app
}

/* c8 ignore start */
// Start the server only when this file is run directly (not when imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3000;
  const DB_PATH = process.env.DB_PATH || '/var/data/db.sqlite';
  const SEED = String(process.env.SEED).toLowerCase() === 'true';

  console.log('ENV → DB_PATH:', process.env.DB_PATH || '(unset)');
  console.log('Using DB path:', DB_PATH);
  console.log('ENV → SEED:', SEED);

  const app = createApp({ dbPath: DB_PATH, seed: SEED });
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}
