// tests/juices.get.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

/**
 * GET /api/v1/juices
 * Contract:
 * - 200 OK: returns array of { id, name, parLiters, currentLiters, lastUpdated, status }
 * - status derivation:
 *    - OUT when currentLiters <= 0
 *    - OK when currentLiters >= parLiters
 *    - BELOW PAR otherwise
 * - lastUpdated is a valid ISO-ish timestamp
 */
describe('GET /api/v1/juices', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('returns list with derived status', async () => {
    const res = await api.get('/api/v1/juices').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    for (const j of res.body) {
      const expected =
        j.currentLiters <= 0
          ? 'OUT'
          : (j.currentLiters >= j.parLiters ? 'OK' : 'BELOW PAR')
      expect(j.status).toBe(expected)
    }
  })

  it('each item has required fields and valid lastUpdated', async () => {
    const res = await api.get('/api/v1/juices').expect(200)
    for (const j of res.body) {
      expect(j).toHaveProperty('id')
      expect(j).toHaveProperty('name')
      expect(typeof j.parLiters).toBe('number')
      expect(typeof j.currentLiters).toBe('number')
      expect(['OK', 'BELOW PAR', 'OUT']).toContain(j.status)
      expect(new Date(j.lastUpdated).toString()).not.toBe('Invalid Date')
    }
  })
})
