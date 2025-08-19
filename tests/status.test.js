import { describe, it, expect } from 'vitest'
import { computeJuiceStatus } from '../lib/status/index.js'

const now = new Date('2025-08-16T12:00:00.000Z')

describe('computeJuiceStatus', () => {
  it('sums remaining liters and flags below PAR', () => {
    const juice = { id: 1, name: 'Balance', parLiters: 6 }
    const batches = [
      { id: 10, madeAt: '2025-08-15T10:00:00.000Z', expiresAt: '2025-08-20T10:00:00.000Z', remainingLiters: 2 },
      { id: 11, madeAt: '2025-08-16T08:00:00.000Z', expiresAt: '2025-08-21T08:00:00.000Z', remainingLiters: 1.5 }
    ]
    const latestCount = { countLiters: 3, countedAt: '2025-08-16T09:00:00.000Z' }

    const s = computeJuiceStatus(juice, batches, latestCount, now)
    expect(s.currentLiters).toBeCloseTo(3.5)
    expect(s.belowPar).toBe(true)
    expect(s.needToMake).toBe(true)
    expect(s.batches[0].isPrimary).toBe(true)   // newest first per repo order
  })

  it('OK at or above PAR', () => {
    const juice = { id: 1, name: 'Balance', parLiters: 3 }
    const batches = [{ id: 1, madeAt:'2025-08-15T00:00:00.000Z', expiresAt:'2025-08-20T00:00:00.000Z', remainingLiters: 3 }]
    const s = computeJuiceStatus(juice, batches, null, now)
    expect(s.belowPar).toBe(false)
  })
})
