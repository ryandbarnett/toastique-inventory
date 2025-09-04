// server.js
import 'dotenv/config'
import express from 'express'
import { initDb, seedDb } from './lib/db/index.js'
import { makeJuicesRepo } from './lib/repo/juices.js'
import { withStatus, validateLiters } from './lib/service/juices.js'
import { makeUserRepo } from './lib/repo/users.mjs'
import { mountAuth as mountAuthPkg, requireAuth as requireAuthPkg } from './packages/auth/src/index.mjs'
import { makeCookieSession } from './packages/auth/src/adapters/session/cookie-session.mjs'

function notFound(res) {
  return res.status(404).json({ error: 'Not Found' })
}

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

  // --- Auth: mount session + /api/auth with one call
  const session = makeCookieSession({
    name: 'sid',
    keys: [process.env.SESSION_SECRET || 'dev-secret'],
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  mountAuthPkg(app, { userRepo: users, session })
  const authRequired = requireAuthPkg(session)

  // GET /api/juices  (?sort=name|status&dir=asc|desc)
  app.get('/api/juices', (req, res, next) => {
    try {
      const rows = juices.listAll()
      const enriched = rows.map(withStatus)

      // Read query params with defaults
      const sort = String(req.query.sort || 'name')
      const dir  = String(req.query.dir  || 'asc')

      // Status ranking for sorting:
      // OUT < BELOW PAR < OK (tie-break by name)
      const rank = { 'OUT': 0, 'BELOW PAR': 1, 'OK': 2 }
      const byName   = (a, b) => a.name.localeCompare(b.name)
      const byStatus = (a, b) => (rank[a.status] - rank[b.status]) || a.name.localeCompare(b.name)

      const cmp = sort === 'status' ? byStatus : byName
      enriched.sort(cmp)
      if (dir === 'desc') { enriched.reverse() }

      res.json(enriched)
    } catch (err) { next(err) }
  })

  // PUT /api/juices/:id/liters (protected)
  app.put('/api/juices/:id/liters', authRequired, (req, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) return notFound(res)

      const { liters } = req.body ?? {}
      const v = validateLiters(liters)
      if (!v.ok) return res.status(400).json({ error: v.message })

      const exists = juices.exists(id)
      if (!exists) return notFound(res)

      const now = new Date().toISOString()
      const userId = req.session.userId
      juices.updateLiters(id, liters, userId, now)

      const updated = juices.getById(id)
      // ensure returned object matches the update exactly
      updated.lastUpdated = now
      // HYDRATE: attach friendly updater name for immediate UI use
      const me = db.prepare(`SELECT name FROM users WHERE id = ?`).get(userId)
      updated.updatedByName = me?.name ?? null
      res.json(withStatus(updated))
    } catch (err) { next(err) }
  })

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

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
