// server.js
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// ---- DB bootstrap ----
const dbPath = path.join(__dirname, 'db.sqlite')
const db = new Database(dbPath)

// Run schema + seed on startup
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schemaSql)

// Prepared statements (fast & simple)
const st = {
  listJuices: db.prepare(`SELECT id, name, default_batch_liters, par_liters, expiry_days FROM juices ORDER BY name`),

  getJuiceByName: db.prepare(`SELECT id, name, default_batch_liters, expiry_days
                              FROM juices WHERE name = ?`),

  insertBatch: db.prepare(`INSERT INTO juice_batches (juice_id, made_at, expires_at, remaining_liters)
                           VALUES (?, ?, ?, ?)`),

  listActiveBatches: db.prepare(`
    SELECT b.id, j.name AS juice_name, b.made_at, b.expires_at, b.remaining_liters
    FROM juice_batches b
    JOIN juices j ON j.id = b.juice_id
    WHERE b.disposed_at IS NULL
      AND b.remaining_liters > 0
      AND b.expires_at > ?
    ORDER BY b.made_at ASC
  `),

  getBatchById: db.prepare(`SELECT id, remaining_liters FROM juice_batches WHERE id = ?`),
  updateBatchRemaining: db.prepare(`UPDATE juice_batches SET remaining_liters = ? WHERE id = ?`),
}

// ---- Routes ----

// Health check
app.get('/health', (req, res) => res.json({ ok: true }))

// List juices (rules + defaults)
app.get('/api/juices', (req, res) => {
  res.json(st.listJuices.all())
})

// List active batches (not disposed, not expired, >0L)
app.get('/api/juice-batches', (req, res) => {
  const nowISO = new Date().toISOString()
  res.json(st.listActiveBatches.all(nowISO))
})

// Create a new batch (computes expires_at from juice.expiry_days)
// Body: { juice_name: string, volume_liters?: number }
app.post('/api/juice-batches', (req, res) => {
  const { juice_name, volume_liters } = req.body ?? {}
  if (!juice_name) return res.status(400).json({ error: 'juice_name is required' })

  const juice = st.getJuiceByName.get(juice_name)
  if (!juice) return res.status(400).json({ error: `Unknown juice: ${juice_name}` })

  const made = new Date()
  const expires = new Date(made)
  expires.setDate(expires.getDate() + (juice.expiry_days ?? 7))

  const vol = Number.isFinite(Number(volume_liters))
    ? Number(volume_liters)
    : (juice.default_batch_liters ?? 0)

  const info = st.insertBatch.run(
    juice.id,
    made.toISOString(),
    expires.toISOString(),
    Math.max(0, vol)
  )

  res.json({
    id: info.lastInsertRowid,
    juice_id: juice.id,
    made_at: made.toISOString(),
    expires_at: expires.toISOString(),
    remaining_liters: Math.max(0, vol),
  })
})

// Pour from a batch
// Body: { batch_id: number, liters: number }
app.post('/api/juice-pour', (req, res) => {
  const { batch_id, liters } = req.body ?? {}
  const amt = Number(liters)
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ error: 'liters must be a positive number' })
  }

  const row = st.getBatchById.get(batch_id)
  if (!row) return res.status(404).json({ error: 'batch not found' })

  const remaining = Math.max(0, row.remaining_liters - amt)
  st.updateBatchRemaining.run(remaining, batch_id)
  res.json({ batch_id, remaining_liters: remaining })
})

// ---- Start server ----
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Toastique Inventory listening on http://localhost:${PORT}`)
})
