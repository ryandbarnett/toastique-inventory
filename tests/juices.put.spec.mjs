// tests/juices.put.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('PUT /api/juices/:id', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('updates full record (name, parLiters, currentLiters)', async () => {
    const { body: list } = await api.get('/api/juices').expect(200)
    const target = list[0]
    const updated = { name: target.name, parLiters: 8, currentLiters: 7.9 }

    await api.put(`/api/juices/${target.id}`)
      .send(updated)
      .set('Content-Type', 'application/json')
      .expect(200)

    const { body: list2 } = await api.get('/api/juices').expect(200)
    const after = list2.find(j => j.id === target.id)
    expect(after.parLiters).toBeCloseTo(8)
    expect(after.currentLiters).toBeCloseTo(7.9)
    expect(after.status).toBe('BELOW PAR') // 7.9 < 8
  })
})
