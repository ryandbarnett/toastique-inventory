-- schema.sql
PRAGMA foreign_keys = ON;

-- Master list of juices (name, default batch size, PAR, expiry rule)
CREATE TABLE IF NOT EXISTS juices (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  default_batch_liters REAL,     -- e.g., 3.79
  par_liters REAL,               -- can be NULL until we decide
  expiry_days INTEGER NOT NULL DEFAULT 7
);

-- Individual made batches
CREATE TABLE IF NOT EXISTS juice_batches (
  id INTEGER PRIMARY KEY,
  juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
  made_at TEXT NOT NULL,         -- ISO timestamp
  expires_at TEXT NOT NULL,      -- ISO timestamp
  remaining_liters REAL NOT NULL,
  disposed_at TEXT                -- ISO timestamp when thrown out (NULL if active)
);

-- Helpful index when listing active batches
CREATE INDEX IF NOT EXISTS idx_juice_batches_active
  ON juice_batches (juice_id, expires_at, disposed_at);

-- ===== Seed data (volumes converted from quarts; 1 qt = 0.946352946 L) =====
-- Expiry: Lemon/Ginger/Lime = 10 days; everything else = 7 days.

INSERT OR IGNORE INTO juices (name, default_batch_liters, par_liters, expiry_days) VALUES
  ('Apple Juice',       7.57, 6.0, 7),
  ('Balance',           3.79, 6.0, 7),
  ('Cure',              3.79, 6.0, 7),
  ('Defender',          4.73, 6.0, 7),
  ('Ginger Juice',      3.79, 4.0, 10),
  ('Lemon Juice',       1.89, 4.0, 10),
  ('Lime Juice',        3.79, 4.0, 10),
  ('Metabolize',        4.73, 6.0, 7),
  ('Pitaya Lemonade',   3.79, 6.0, 7),
  ('Radiance',          5.68, 6.0, 7),
  ('Recharge',          4.73, 6.0, 7),
  ('Summer Seasonal',   5.68, 6.0, 7);