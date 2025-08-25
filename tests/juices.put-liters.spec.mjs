// tests/juices.put-liters.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

/**
 * PUT /api/juices/:id/liters
 * Contract:
 * - Body: { liters: number } (finite, >= 0)
 * - 200 OK: returns the updated juice record with derived `status`
 * - 400 Bad Request on invalid body
 * - 404 Not Found if :id does not exist
 * - Side effect: updates `currentLiters` and auto-updates `lastUpdated`
 */
describe('PUT /api/juices/:id/liters', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('updates currentLiters, returns updated record, and bumps lastUpdated (list-only flow)', async () => {
    // Baseline from list
    const listBefore = await api.get('/api/juices').expect(200)
    expect(listBefore.body.length).toBeGreaterThan(0)
    const j0 = listBefore.body[0]
    const prevStamp = Date.parse(j0.lastUpdated)
    expect(Number.isNaN(prevStamp)).toBe(false)

    // Put liters ABOVE par => expect OK
    const newLiters = j0.parLiters + 0.5
    const putRes = await api.put(`/api/juices/${j0.id}/liters`).send({ liters: newLiters }).expect(200)

    const updated = putRes.body
    expect(updated.id).toBe(j0.id)
    expect(updated.currentLiters).toBeCloseTo(newLiters)
    expect(updated.status).toBe('OK')
    const newStamp = Date.parse(updated.lastUpdated)
    expect(Number.isNaN(newStamp)).toBe(false)
    expect(newStamp).toBeGreaterThan(prevStamp)

    // Verify via list-after (no /:id endpoint)
    const listAfter = await api.get('/api/juices').expect(200)
    const jAfter = listAfter.body.find(x => x.id === j0.id)
    expect(jAfter).toBeTruthy()
    expect(jAfter.currentLiters).toBeCloseTo(newLiters)
    expect(jAfter.status).toBe('OK')
    expect(Date.parse(jAfter.lastUpdated)).toBe(newStamp)
  })

  it('can set liters BELOW par to derive "BELOW PAR"', async () => {
    const list = await api.get('/api/juices').expect(200)
    const j0 = list.body[0]
    const low = Math.max(0, j0.parLiters - 0.25)

    const res = await api
      .put(`/api/juices/${j0.id}/liters`)
      .send({ liters: low })
      .expect(200)

    expect(res.body.currentLiters).toBeCloseTo(low)
    expect(res.body.status).toBe('BELOW PAR')
  })

  it('rejects invalid liters (non-number, negative, missing, null, boolean, object, >30 cap)', async () => {
    const list = await api.get('/api/juices').expect(200)
    const id = list.body[0].id

    await api.put(`/api/juices/${id}/liters`).send({ liters: '5' }).expect(400)   // string
    await api.put(`/api/juices/${id}/liters`).send({ liters: -1 }).expect(400)    // negative
    await api.put(`/api/juices/${id}/liters`).send({}).expect(400)                // missing
    await api.put(`/api/juices/${id}/liters`).send({ liters: null }).expect(400)  // null
    await api.put(`/api/juices/${id}/liters`).send({ liters: true }).expect(400)  // boolean
    await api.put(`/api/juices/${id}/liters`).send({ liters: { n: 5 } }).expect(400) // object
    await api.put(`/api/juices/${id}/liters`).send({ liters: 31 }).expect(400)    // >30 cap
    // Note: JSON.stringify(Infinity/NaN) => null, so covered by the 'null' case.
  })

  it('404s on unknown juice id', async () => {
    await api.put('/api/juices/999999/liters').send({ liters: 1 }).expect(404)
  })
})
