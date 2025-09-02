// lib/db/db.js
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedRows } from './seed.js'
import { seedAuthUsers } from '../../auth/seed.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DB_PATH = process.env.DB_PATH || './db.sqlite'
let _db = null

// Resolve schema files once
const CORE_SCHEMA_PATH = path.join(__dirname, 'schema.sql')
// lib/db/db.js -> ../../auth/schema.sql
const AUTH_SCHEMA_PATH = path.join(__dirname, '..', '..', 'auth', 'schema.sql')

/** Read core schema (required) + auth schema (optional) */
function readSchemas() {
  let coreSql = ''
  try {
    coreSql = fs.readFileSync(CORE_SCHEMA_PATH, 'utf8')
  } catch (e) {
    throw new Error(`Missing core schema at ${CORE_SCHEMA_PATH}: ${e.message}`)
  }

  let authSql = ''
  try {
    authSql = fs.readFileSync(AUTH_SCHEMA_PATH, 'utf8')
  } catch {
    // auth/schema.sql is optional during refactor; skip if missing
  }

  return coreSql + '\n' + authSql
}

/** Ensure directory exists for file-based DBs (no-op for ':memory:') */
function ensureDirFor(dbPath) {
  if (!dbPath || dbPath === ':memory:') return
  const dir = path.dirname(dbPath)
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Initialize SQLite and apply schemas.
 * @param {string} dbPath
 * @returns {import('better-sqlite3').Database}
 */
export function initDb(dbPath = DEFAULT_DB_PATH) {
  ensureDirFor(dbPath)
  const db = new Database(dbPath)

  try { db.pragma('foreign_keys = ON') } catch {}
  try { db.pragma('journal_mode = WAL') } catch {}

  db.exec(readSchemas())
  return db
}

/** Seed initial data (idempotent) */
export function seedDb(db) {
  // 1) Seed users first (so Ryan exists)
  seedAuthUsers(db);

  // 2) Find Ryan's user id
  const row = db.prepare('SELECT id FROM users WHERE name = ?').get('Ryan');
  const ryanId = row?.id ?? null;

  // 3) Seed juices if empty
  const { n: juicesCount } = db.prepare('SELECT COUNT(*) AS n FROM juices').get();
  if (juicesCount === 0) {
    const now = new Date().toISOString();
    const insertJuice = db.prepare(`
      INSERT INTO juices (name, parLiters, currentLiters, lastUpdated, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    const rows = seedRows(now, ryanId);
    const tx = db.transaction(rs => { for (const r of rs) insertJuice.run(...r); });
    tx(rows);
  }
}


/**
 * Get a singleton DB (optionally seeded).
 * @param {{ path?: string, seed?: boolean }} opts
 */
export function getDb({ path: dbPath = DEFAULT_DB_PATH, seed = true } = {}) {
  if (!_db) {
    _db = initDb(dbPath)
    if (seed) seedDb(_db)
  }
  return _db
}

/** Close and clear the singleton (useful for tests) */
export function _resetDbForTests() {
  if (_db) { try { _db.close() } catch {} }
  _db = null
}

// Optional public close helper (handy outside tests)
// export function closeDb() { _resetDbForTests() }
