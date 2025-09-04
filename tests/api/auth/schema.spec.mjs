// tests/auth.schema.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { initDb, seedDb, _resetDbForTests } from '../../../lib/db/index.js'

describe('DB schema: users table + seed', () => {
  let db

  beforeEach(() => {
    _resetDbForTests()
    db = initDb(':memory:')
    seedDb(db)
  })

  it('has a users table with id, name, pin_hash', () => {
    const cols = db.prepare(`PRAGMA table_info('users')`).all()
    const names = cols.map(c => c.name)
    expect(names).toContain('id')
    expect(names).toContain('name')
    expect(names).toContain('pin_hash')
  })

  it('seeds at least one user with NULL pin_hash', () => {
    const rows = db.prepare(`SELECT name, pin_hash FROM users`).all()
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.pin_hash).toBeNull()
    }
  })
})
