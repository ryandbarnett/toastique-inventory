import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Create and export a singleton DB instance
export const getDb = async () => {
  const db = await open({
    filename: `${__dirname}/../db.sqlite`,
    driver: sqlite3.Database
  })

  // Create inventory table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity REAL DEFAULT 0,
      unit TEXT NOT NULL,
      lastUpdated TEXT NOT NULL
    )
  `)

  return db
}