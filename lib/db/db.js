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
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM juices').get()
  if (n > 0) return
  const now = new Date().toISOString()
  const insert = db.prepare(`
    INSERT INTO juices (name, parLiters, currentLiters, lastUpdated)
    VALUES (?, ?, ?, ?)
  `)
  const rows = seedRows(now)
  const tx = db.transaction(rs => rs.forEach(r => insert.run(...r)))
  tx(rows)
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
