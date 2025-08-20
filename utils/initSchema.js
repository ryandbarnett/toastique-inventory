// utils/initSchema.js
/**
 * @param {import('./db.js').DB} db
 */
export async function initSchema(db) {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS juices (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      par_liters REAL NOT NULL,
      display_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS juice_batches (
      id INTEGER PRIMARY KEY,
      juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
      volume_liters REAL NOT NULL CHECK (volume_liters >= 0),
      remaining_liters REAL NOT NULL CHECK (remaining_liters >= 0),
      made_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      disposed_at TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS juice_counts (
      id INTEGER PRIMARY KEY,
      juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
      count_liters REAL NOT NULL,
      counted_at TEXT NOT NULL,
      count_date TEXT NOT NULL,
      note TEXT
      -- NOTE: No UNIQUE(juice_id,count_date) here since we store multiple per-day
    );

    -- Indexes aligned with queries:
    CREATE INDEX IF NOT EXISTS idx_counts_date_juice_counted
      ON juice_counts(count_date, juice_id, counted_at);

    CREATE INDEX IF NOT EXISTS idx_batches_active
      ON juice_batches(juice_id, expires_at)
      WHERE disposed_at IS NULL AND remaining_liters > 0;

    CREATE INDEX IF NOT EXISTS idx_batches_by_juice_made
      ON juice_batches(juice_id, made_at);
  `)
}
