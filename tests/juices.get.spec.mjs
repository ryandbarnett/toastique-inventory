// tests/juices.get.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/juices', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('returns list with derived status', async () => {
    const res = await api.get('/api/juices').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    for (const j of res.body) {
      const expected = j.currentLiters >= j.parLiters ? 'OK' : 'BELOW PAR'
      expect(j.status).toBe(expected)
    }
  })

  it('each item has required fields and valid lastUpdated', async () => {
  const res = await api.get('/api/juices').expect(200)
    for (const j of res.body) {
      expect(typeof j.id).toBe('number')
      expect(typeof j.name).toBe('string')
      expect(typeof j.parLiters).toBe('number')
      expect(typeof j.currentLiters).toBe('number')
      expect(['OK', 'BELOW PAR']).toContain(j.status)
      expect(new Date(j.lastUpdated).toString()).not.toBe('Invalid Date')
    }
  })
})
