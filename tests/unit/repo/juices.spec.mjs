// tests/unit/repo/juices.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { initDb, seedDb, _resetDbForTests } from '../../../lib/db/index.js'
import { makeJuicesRepo } from '../../../lib/repo/juices.js'

describe('repo/juices (pure DB layer)', () => {
  let db, repo

  beforeEach(async () => {
    await _resetDbForTests?.()
    db = await initDb(':memory:')
    await seedDb(db)
    repo = makeJuicesRepo(db)
  })

  it('listAll returns rows with expected columns', () => {
    const list = repo.listAll()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)

    const j = list[0]
    expect(j).toHaveProperty('id')
    expect(j).toHaveProperty('name')
    expect(j).toHaveProperty('parLiters')
    expect(j).toHaveProperty('currentLiters')
    expect(j).toHaveProperty('lastUpdated')
    // optional but nice since your SELECT includes it
    expect(j).toHaveProperty('updatedByName')

    expect(typeof j.id).toBe('number')
    expect(typeof j.name).toBe('string')
    expect(typeof j.parLiters).toBe('number')
    expect(typeof j.currentLiters).toBe('number')
    expect(Number.isNaN(Date.parse(j.lastUpdated))).toBe(false)
  })

  it('exists/getById distinguishes present vs missing IDs', () => {
    const first = repo.listAll()[0]
    const someId = first.id

    // exists(id) returns a row or undefined/null
    expect(Boolean(repo.exists(someId))).toBe(true)
    expect(Boolean(repo.exists(999999))).toBe(false)

    const found = repo.getById(someId)
    const missing = repo.getById(999999)
    expect(found?.id).toBe(someId)
    expect(missing).toBeFalsy()
  })

  it('updateLiters persists value, bumps lastUpdated, and stamps updated_by', () => {
    const before = repo.listAll()[0]
    const targetId = before.id
    const newLiters = before.currentLiters + 0.5
    const nowISO = new Date().toISOString()

    const res = repo.updateLiters(targetId, newLiters, /*userId*/ 1, nowISO)
    expect(res?.changes ?? res).toBe(1) // better-sqlite3 returns { changes, lastInsertRowid }

    const after = repo.getById(targetId)
    expect(after.currentLiters).toBeCloseTo(newLiters)
    // since we passed nowISO directly, this should match exactly
    expect(after.lastUpdated).toBe(nowISO)
  })
})
