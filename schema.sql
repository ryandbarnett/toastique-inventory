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

-- ===== Twice-daily inventory checks (AM/PM snapshots) =====
CREATE TABLE IF NOT EXISTS juice_inventory_checks (
  id INTEGER PRIMARY KEY,
  juice_id INTEGER NOT NULL REFERENCES juices(id) ON DELETE CASCADE,
  checked_at TEXT NOT NULL,              -- ISO timestamp (when measured)
  shift TEXT NOT NULL CHECK (shift IN ('AM','PM','OTHER')),
  liters REAL NOT NULL,
  recorder TEXT                           -- optional: who recorded it
);

CREATE INDEX IF NOT EXISTS idx_checks_juice_time
  ON juice_inventory_checks (juice_id, checked_at);

-- Optional: at most one reading per juice per shift per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_checks_unique_per_day_shift
ON juice_inventory_checks (
  juice_id,
  substr(checked_at, 1, 10),   -- YYYY-MM-DD
  shift
);

-- ===== Optional seed checks (only when no checks exist) =====
WITH seed(name, days_ago, shift, liters) AS (
  VALUES
    -- A few realistic samples: AM higher, PM lower after sales
    ('Apple Juice',       2, 'AM', 8.0), ('Apple Juice',       2, 'PM', 5.0),
    ('Apple Juice',       1, 'AM', 7.0), ('Apple Juice',       1, 'PM', 4.0),
    ('Apple Juice',       0, 'AM', 6.5),

    ('Ginger Juice',      1, 'AM', 2.5), ('Ginger Juice',      1, 'PM', 1.2),
    ('Ginger Juice',      0, 'AM', 1.8),

    ('Lemon Juice',       1, 'AM', 3.8), ('Lemon Juice',       1, 'PM', 2.0),
    ('Lemon Juice',       0, 'AM', 3.2),

    ('Radiance',          1, 'AM', 5.0), ('Radiance',          1, 'PM', 3.0),
    ('Radiance',          0, 'AM', 5.68),

    ('Summer Seasonal',   1, 'AM', 4.0), ('Summer Seasonal',   1, 'PM', 2.2),
    ('Summer Seasonal',   0, 'AM', 5.2)
)
INSERT INTO juice_inventory_checks (juice_id, checked_at, shift, liters, recorder)
SELECT
  j.id,
  datetime('now', printf('-%d days', s.days_ago)),
  s.shift,
  s.liters,
  NULL
FROM seed s
JOIN juices j ON j.name = s.name
WHERE NOT EXISTS (SELECT 1 FROM juice_inventory_checks);
