// db.js
import Database from 'better-sqlite3'

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS juices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parLiters REAL NOT NULL,
  currentLiters REAL NOT NULL,
  lastUpdated TEXT NOT NULL
);
`

// Default path can be overridden with env
const DEFAULT_DB_PATH = process.env.DB_PATH || './db.sqlite'

// Singleton handle so we don't open multiple connections
let _db = null

export function initDb(dbPath = DEFAULT_DB_PATH) {
  const db = new Database(dbPath)
  // Safe pragmas; no behavior change to your queries
  try { db.pragma('foreign_keys = ON') } catch {}
  try { db.pragma('journal_mode = WAL') } catch {}

  db.exec(SCHEMA_SQL)
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
  const seedRows = [
    // OK (>= par)
    ['Apple Juice', 6, 6, now],
    ['Balance', 6, 7, now],
    ['Defender', 6, 6.5, now],
    ['Radiance', 6, 8, now],
    // BELOW PAR (0 < liters < par)
    ['Cure', 6, 4, now],
    ['Metabolize', 6, 2, now],
    ['Pitaya Lemonade', 6, 1.5, now],
    ['Lemon', 4, 2, now],
    // OUT (0 liters)
    ['Ginger', 4, 0, now],
    ['Lime', 4, 0, now],
    ['Recharge', 6, 0, now],
    ['Summer Seasonal', 6, 0, now]
  ]
  const tx = db.transaction(rows => rows.forEach(r => insert.run(...r)))
  tx(seedRows)
}

/**
 * Preferred accessor for app code: returns a memoized DB.
 * By default, seeds only on first open if DB is empty.
 */
export function getDb({ path = DEFAULT_DB_PATH, seed = true } = {}) {
  if (!_db) {
    _db = initDb(path)
    if (seed) seedDb(_db)
  }
  return _db
}

/**
 * Test-only utility to reset/move the singleton (e.g., to ':memory:').
 * Safe to leave unused in production.
 */
export function _resetDbForTests() {
  if (_db) {
    try { _db.close() } catch {}
  }
  _db = null
}
