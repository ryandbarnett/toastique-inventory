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

  await db.exec(`PRAGMA foreign_keys = ON;`)

  // --- Juices + append-only counts (existing) ---
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

    CREATE INDEX IF NOT EXISTS idx_counts_date_juice
      ON juice_counts(count_date, juice_id);
  `)

  // --- NEW: per-batch storage ---
  // Each batch has its own made/expire times and volumes.
  // We'll compute expires_at = made_at + 5 days in the API (step 2).
  await db.exec(`
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

    -- Order & lookups
    CREATE INDEX IF NOT EXISTS idx_batches_by_juice_made
      ON juice_batches(juice_id, made_at);

    -- Fast "active batches" scans (not disposed, >0 remaining)
    CREATE INDEX IF NOT EXISTS idx_batches_active
      ON juice_batches(juice_id, expires_at)
      WHERE disposed_at IS NULL AND remaining_liters > 0;
  `)

  // Seed (idempotent). Adjust PARs later if needed.
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

  return db
}
