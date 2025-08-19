import { describe, it, expect, beforeEach } from 'vitest'
import { makeTestDb, seedJuices } from './helpers/testDb.js'
import * as repo from '../lib/repo/index.js'
import * as service from '../lib/service/index.js'

// monkey-patch repo.getDb to return our test db
let db
repo.getDb = async () => db

beforeEach(async () => {
  db = await makeTestDb()
  await seedJuices(db)
})

describe('service.createBatch', () => {
  it('creates from explicit liters', async () => {
    const batch = await service.createBatch(1, { volumeLiters: 3.2, note: 'test' })
    expect(typeof batch.id).toBe('number')
    expect(batch.remainingLiters).toBeCloseTo(3.2)
    expect(new Date(batch.madeAt).toString()).not.toBe('Invalid Date')
    expect(new Date(batch.expiresAt).toString()).not.toBe('Invalid Date')
  })

  it('creates from numeric size (1.5) using recipe yields', async () => {
    const batch = await service.createBatch(1, { size: 1.5 })
    expect(batch.remainingLiters).toBeGreaterThan(0)
    expect(new Date(batch.madeAt).toString()).not.toBe('Invalid Date')
    expect(new Date(batch.expiresAt).toString()).not.toBe('Invalid Date')
  })

  it('rejects non-numeric sizes', async () => {
    await expect(service.createBatch(1, { size: '1.5x' })).rejects.toThrow(/size must be 1 or 1\.5/i)
  })

  it('rejects numeric sizes other than 1 or 1.5', async () => {
    await expect(service.createBatch(1, { size: 2 })).rejects.toThrow(/size must be 1 or 1\.5/i)
    await expect(service.createBatch(1, { size: 1.2 })).rejects.toThrow(/size must be 1 or 1\.5/i)
  })
})

describe('service.addDailyCount', () => {
  it('records today’s count and returns timestamps', async () => {
    const { countedAt, countDate } = await service.addJuiceCount(1, 2.5, 'AM count')
    expect(new Date(countedAt).toString()).not.toBe('Invalid Date')
    expect(countDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('service.updateBatch', () => {
  it('updates remaining and note', async () => {
    const batch = await service.createBatch(1, { volumeLiters: 4 })
    const updated = await service.updateBatch(batch.id, { remainingLiters: 2, note: 'used half' })
    expect(updated.remainingLiters).toBeCloseTo(2)
    expect(updated.note).toBe('used half')
  })
})
