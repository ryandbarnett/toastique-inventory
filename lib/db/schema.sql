CREATE TABLE IF NOT EXISTS juices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parLiters REAL NOT NULL,
  currentLiters REAL NOT NULL,
  lastUpdated TEXT NOT NULL
);

-- Users (minimal: id, name, pin_hash)
CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL UNIQUE,
  pin_hash TEXT
);