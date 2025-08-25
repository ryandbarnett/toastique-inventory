// server.js
import 'dotenv/config'
import express from 'express'
import { initDb, seedDb } from './db.js'

function withStatus(row) {
  if (row.currentLiters <= 0) {
    return { ...row, status: 'OUT' }
  }
  if (row.currentLiters >= row.parLiters) {
    return { ...row, status: 'OK' }
  }
  return { ...row, status: 'BELOW PAR' }
}

/**
 * Factory used by tests (helpers.mjs) and by production entrypoint below.
 * @param {{ dbPath?: string, seed?: boolean }} opts
 */
export function createApp({ dbPath = 'db.sqlite', seed = false } = {}) {
  const app = express()
  app.use(express.json())
  app.use(express.static('public'))

  const db = initDb(dbPath)
  if (seed) seedDb(db)

  // GET /api/juices → list with derived status
  app.get('/api/juices', (_req, res, next) => {
    try {
      const rows = db.prepare(`
        SELECT id, name, parLiters, currentLiters, lastUpdated
        FROM juices
        ORDER BY id ASC
      `).all()
      res.json(rows.map(withStatus))
    } catch (err) { next(err) }
  })

  // PUT /api/juices/:id/liters → update currentLiters + lastUpdated
  app.put('/api/juices/:id/liters', (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const { liters } = req.body ?? {}
      const MAX_LITERS = 30

      if (!Number.isInteger(id)) return res.status(404).json({ error: 'Not Found' })
      if (typeof liters !== 'number' || !Number.isFinite(liters) || liters < 0 || liters > MAX_LITERS) {
        return res.status(400).json({
          error: `liters must be a finite number between 0 and ${MAX_LITERS}`
        })
      }

      const exists = db.prepare('SELECT id FROM juices WHERE id = ?').get(id)
      if (!exists) return res.status(404).json({ error: 'Not Found' })

      const now = new Date().toISOString()
      db.prepare(`
        UPDATE juices
           SET currentLiters = ?, lastUpdated = ?
         WHERE id = ?
      `).run(liters, now, id)

      const updated = db.prepare(`
        SELECT id, name, parLiters, currentLiters, lastUpdated
          FROM juices
         WHERE id = ?
      `).get(id)

      res.json(withStatus(updated))
    } catch (err) { next(err) }
  })

  // minimal JSON error handler
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

// If run directly, start the server (Render sets PORT)
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000)
  const dbPath = process.env.DB_PATH || 'db.sqlite'
  const seed = process.env.SEED === 'true'
  const app = createApp({ dbPath, seed })
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`)
  })
}
