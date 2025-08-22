// tests/juices.put-liters.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('PUT /api/juices/:id/liters', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('sets absolute liters (end-of-day) and recalculates status', async () => {
    const { body: list } = await api.get('/api/juices').expect(200)
    const target = list[0]

    await api.put(`/api/juices/${target.id}/liters`)
      .send({ liters: target.parLiters + 1 })
      .set('Content-Type', 'application/json')
      .expect(200)

    const { body: afterList } = await api.get('/api/juices').expect(200)
    const after = afterList.find(j => j.id === target.id)
    expect(after.currentLiters).toBeCloseTo(target.parLiters + 1)
    expect(after.status).toBe('OK')
  })
})
