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

export function initDb(dbPath) {
  const db = new Database(dbPath)
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
    ['Apple Juice', 6, 7, now],
    ['Ginger', 4, 3, now],
    ['Lemon', 4, 4, now],
  ]
  const tx = db.transaction(rows => rows.forEach(r => insert.run(...r)))
  tx(seedRows)
}
