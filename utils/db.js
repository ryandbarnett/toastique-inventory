// utils/db.js
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const getDb = async () => {
  const db = await open({
    filename: `${__dirname}/../db.sqlite`,
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity REAL DEFAULT 0,
      unit TEXT NOT NULL,
      lastUpdated TEXT NOT NULL,
      par INTEGER
    )
  `)

  return db
}

