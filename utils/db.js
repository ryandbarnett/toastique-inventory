// utils/db.js
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

/**
 * Minimal DB typedef for JSDoc (run/get/all as used by repos).
 * @typedef {Object} DB
 * @property {(sql:string, params?:any[]) => Promise<{ lastID?: number, changes?: number }>} run
 * @property {(sql:string, params?:any[]) => Promise<any>} get
 * @property {(sql:string, params?:any[]) => Promise<any[]>} all
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
let _dbPromise /** @type {Promise<DB> | null} */ = null

export const getDb = async () => {
  if (_dbPromise) return _dbPromise

  _dbPromise = open({
    filename: join(__dirname, '../db.sqlite'),
    driver: sqlite3.Database,
  }).then(async (db) => {
    await db.exec(`PRAGMA foreign_keys = ON;`)

    // --- Core tables ---
    await db.exec(`
      CREATE TABLE IF NOT EXISTS juices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        par_liters REAL NOT NULL,
        display_order INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS juice_counts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
        count_liters REAL NOT NULL,
        counted_at TEXT NOT NULL,   -- ISO timestamp
        count_date TEXT NOT NULL,   -- YYYY-MM-DD
        note TEXT
      );

      CREATE TABLE IF NOT EXISTS juice_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
        made_at TEXT NOT NULL,          -- ISO timestamp
        expires_at TEXT NOT NULL,       -- ISO timestamp
        volume_liters REAL NOT NULL CHECK (volume_liters >= 0),
        remaining_liters REAL NOT NULL CHECK (remaining_liters >= 0),
        disposed_at TEXT,               -- ISO when tossed/empty (NULL = active)
        note TEXT
      );
    `)

    // --- Indexes tuned for your queries ---
    await db.exec(`
      -- Latest counts by day -> need counted_at for MAX()
      CREATE INDEX IF NOT EXISTS idx_counts_date_juice_counted
        ON juice_counts(count_date, juice_id, counted_at);

      -- Fast "active batches" scans (filtered to active)
      CREATE INDEX IF NOT EXISTS idx_batches_active
        ON juice_batches(juice_id, expires_at)
        WHERE disposed_at IS NULL AND remaining_liters > 0;

      -- Optional: lookups or sorts by made_at
      CREATE INDEX IF NOT EXISTS idx_batches_by_juice_made
        ON juice_batches(juice_id, made_at);
    `)

    // Seed (idempotent)
    await db.exec(`
      INSERT OR IGNORE INTO juices (name, par_liters, display_order) VALUES
        ('Balance', 6, 1),
        ('Recharge', 6, 2),
        ('Metabolize', 6, 3),
        ('Radiance', 6, 4),
        ('Cure', 6, 5),
        ('Defender', 6, 6),
        ('Pitaya Lemonade', 6, 7);
    `)

    return /** @type {DB} */ (db)
  })

  return _dbPromise
}
