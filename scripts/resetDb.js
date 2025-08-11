// scripts/resetDb.js
import { getDb } from '../utils/db.js'

const db = await getDb()
await db.exec('DROP TABLE IF EXISTS inventory;')
await db.exec(`
  CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    unit TEXT NOT NULL,
    lastUpdated TEXT NOT NULL,
    par INTEGER
  )
`)
console.log('Inventory DB reset.')
await db.close()
