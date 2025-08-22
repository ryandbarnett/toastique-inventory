// tests/juices.post.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('POST /api/juices', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('creates a juice and shows up in list', async () => {
    await api.post('/api/juices')
      .send({ name: 'Ginger Lemon', parLiters: 6, currentLiters: 4.5 })
      .set('Content-Type', 'application/json')
      .expect(201)

    const { body } = await api.get('/api/juices').expect(200)
    const found = body.find(j => j.name === 'Ginger Lemon')
    expect(found).toBeTruthy()
    expect(found.currentLiters).toBeCloseTo(4.5)
    expect(found.status).toBe('BELOW PAR')
  })

  it('validates name', async () => {
    const res = await api.post('/api/juices')
      .send({ parLiters: 6, currentLiters: 1 })
      .set('Content-Type', 'application/json')
      .expect(400)
    expect(res.body.error).toMatch(/name/i)
  })

  it('rejects duplicate names', async () => {
    await api.post('/api/juices')
      .send({ name: 'Orange', parLiters: 6, currentLiters: 2 })
      .set('Content-Type', 'application/json')
      .expect(201)

    const dup = await api.post('/api/juices')
      .send({ name: 'Orange', parLiters: 6, currentLiters: 1 })
      .set('Content-Type', 'application/json')
      .expect(400)
    expect(dup.body.error).toMatch(/unique|exists|duplicate/i)
  })
})
