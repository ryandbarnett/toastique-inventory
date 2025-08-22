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
})
