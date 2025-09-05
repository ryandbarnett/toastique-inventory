-- auth/schema.sql
CREATE TABLE IF NOT EXISTS users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL UNIQUE,
  pin_hash  TEXT,
  role      TEXT NOT NULL DEFAULT 'staff'
            CHECK (role IN ('staff','admin'))
);