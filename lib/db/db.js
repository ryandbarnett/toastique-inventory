// lib/db/db.js
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedRows } from './seed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DB_PATH = process.env.DB_PATH || './db.sqlite'
let _db = null

function readSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  return fs.readFileSync(schemaPath, 'utf8')
}

export function initDb(dbPath = DEFAULT_DB_PATH) {
  const db = new Database(dbPath)
  try { db.pragma('foreign_keys = ON') } catch {}
  try { db.pragma('journal_mode = WAL') } catch {}

  db.exec(readSchema())
  return db
}

export function seedDb(db) {
  // --- Seed juices (only if empty)
  const { n: juicesCount } = db.prepare('SELECT COUNT(*) AS n FROM juices').get()
  if (juicesCount === 0) {
    const now = new Date().toISOString()
    const insertJuice = db.prepare(`
    INSERT INTO juices (name, parLiters, currentLiters, lastUpdated)
    VALUES (?, ?, ?, ?)
    `)
    const rows = seedRows(now)
    const txJ = db.transaction(rs => rs.forEach(r => insertJuice.run(...r)))
    txJ(rows)
  }

  // --- Seed users (only if empty)
  try {
    const { n: usersCount } = db.prepare('SELECT COUNT(*) AS n FROM users').get()
    if (usersCount === 0) {
      const seedNames = [
      // You’ll replace/extend these later with real staff names
      'Staff'
      ]
      const insUser = db.prepare(`INSERT INTO users (name, pin_hash) VALUES (?, NULL)`)
      const txU = db.transaction(names => names.forEach(n => insUser.run(n)))
      txU(seedNames)
    }
  } catch (e) {
    // If tests hit here, the users table likely wasn't created; but our schema adds it above.
    // Leave empty to avoid breaking older installs.
  }
}

export function getDb({ path = DEFAULT_DB_PATH, seed = true } = {}) {
  if (!_db) {
    _db = initDb(path)
    if (seed) seedDb(_db)
  }
  return _db
}

export function _resetDbForTests() {
  if (_db) { try { _db.close() } catch {} }
  _db = null
}
