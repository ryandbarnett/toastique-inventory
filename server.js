// server.js
import 'dotenv/config'
import express from 'express'
import { initDb, seedDb } from './lib/db/index.js'
import { makeJuicesRepo } from './lib/repo/juices.js'
import { withStatus, validateLiters } from './lib/service/juices.js'

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

  const db = initDb(dbPath)
  if (seed) seedDb(db)

  const juices = makeJuicesRepo(db)

  // GET /api/juices
  app.get('/api/juices', (_req, res, next) => {
    try {
      const rows = juices.listAll()
      res.json(rows.map(withStatus))
    } catch (err) { next(err) }
  })

  // PUT /api/juices/:id/liters
  app.put('/api/juices/:id/liters', (req, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) return notFound(res)

      const { liters } = req.body ?? {}
      const v = validateLiters(liters)
      if (!v.ok) return res.status(400).json({ error: v.message })

      const exists = juices.exists(id)
      if (!exists) return notFound(res)

      const now = new Date().toISOString()
      juices.updateLiters(id, liters, now)

      const updated = juices.getById(id)
      // ensure returned object matches the update exactly
      updated.lastUpdated = now
      res.json(withStatus(updated))
    } catch (err) { next(err) }
  })

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

// Start the server only when this file is run directly (not when imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3000;
  const app = createApp({ seed: process.env.SEED === 'true' }); // optional: seed via env
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}
