// utils/initSchema.js
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
      liters REAL NOT NULL,
      remaining_liters REAL NOT NULL,
      made_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      disposed_at TEXT,
      note TEXT,
      CHECK (remaining_liters >= 0),
      CHECK (remaining_liters <= liters)
    );

    CREATE TABLE IF NOT EXISTS juice_counts (
      id INTEGER PRIMARY KEY,
      juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
      count_liters REAL NOT NULL,
      counted_at TEXT NOT NULL,
      count_date TEXT NOT NULL,
      note TEXT,
      UNIQUE (juice_id, count_date)
    );
  `)
}
