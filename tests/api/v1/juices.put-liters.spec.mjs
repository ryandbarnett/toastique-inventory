// tests/api/v1/juices.put-liters.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { createTestAgent, api } from '../../helpers/app.mjs'
import { loginAs } from '../../helpers/auth.mjs'

/**
 * PUT /api/v1/juices/:id/liters
 * Contract:
 * - Body: { liters: number } (finite, >= 0)
 * - 200 OK: returns the updated juice record with derived `status`
 * - 400 Bad Request on invalid body
 * - 404 Not Found if :id does not exist
 * - Side effect: updates `currentLiters` and auto-updates `lastUpdated`
 */
describe('PUT /api/v1/juices/:id/liters', () => {
  let agent
  beforeEach(async () => {
    agent = createTestAgent({ seed: true })
    await loginAs(agent)
  })

  it('updates currentLiters, returns updated record, and bumps lastUpdated (list-only flow)', async () => {
    // Baseline from list
    const listBefore = await agent.get(api.juices.list()).expect(200)
    expect(listBefore.body.length).toBeGreaterThan(0)
    const j0 = listBefore.body[0]
    const prevStamp = Date.parse(j0.lastUpdated)
    expect(Number.isNaN(prevStamp)).toBe(false)

    // Put liters ABOVE par => expect OK
    const newLiters = j0.parLiters + 0.5
    const putRes = await agent.put(api.juices.liters(j0.id)).send({ liters: newLiters }).expect(200)

    const updated = putRes.body
    expect(updated.id).toBe(j0.id)
    expect(updated.currentLiters).toBeCloseTo(newLiters)
    expect(updated.status).toBe('OK')
    const newStamp = Date.parse(updated.lastUpdated)
    expect(Number.isNaN(newStamp)).toBe(false)
    expect(newStamp).toBeGreaterThan(prevStamp)

    // Verify via list-after (no /:id endpoint)
    const listAfter = await agent.get(api.juices.list()).expect(200)
    const jAfter = listAfter.body.find(x => x.id === j0.id)
    expect(jAfter).toBeTruthy()
    expect(jAfter.currentLiters).toBeCloseTo(newLiters)
    expect(jAfter.status).toBe('OK')
    expect(Date.parse(jAfter.lastUpdated)).toBe(newStamp)
  })

  it('always bumps lastUpdated even if liters did not change', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]
    const sameLiters = j0.currentLiters

    const res1 = await agent.put(api.juices.liters(j0.id)).send({ liters: sameLiters }).expect(200)
    const t1 = Date.parse(res1.body.lastUpdated)

    // wait a tiny bit to ensure timestamp difference (depends on precision in your impl)
    await new Promise(r => setTimeout(r, 25))

    const res2 = await agent.put(api.juices.liters(j0.id)).send({ liters: sameLiters }).expect(200)
    const t2 = Date.parse(res2.body.lastUpdated)

    expect(t2).toBeGreaterThan(t1)
  })

  it('can set liters BELOW par to derive "BELOW PAR"', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]
    const low = Math.max(0, j0.parLiters - 0.25)

    const res = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: low })
      .expect(200)

    expect(res.body.currentLiters).toBeCloseTo(low)
    expect(res.body.status).toBe('BELOW PAR')
  })

  it('rejects invalid liters (non-number, negative, missing, null, boolean, object, >30 cap)', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const id = list.body[0].id

    await agent.put(api.juices.liters(id)).send({ liters: '5' }).expect(400)        // string
    await agent.put(api.juices.liters(id)).send({ liters: -1 }).expect(400)         // negative
    await agent.put(api.juices.liters(id)).send({}).expect(400)                     // missing
    await agent.put(api.juices.liters(id)).send({ liters: null }).expect(400)       // null
    await agent.put(api.juices.liters(id)).send({ liters: true }).expect(400)       // boolean
    await agent.put(api.juices.liters(id)).send({ liters: { n: 5 } }).expect(400)   // object
    await agent.put(api.juices.liters(id)).send({ liters: 31 }).expect(400)         // >30 cap
    // Note: JSON.stringify(Infinity/NaN) => null, so covered by the 'null' case.
  })

  it('404s on unknown juice id', async () => {
    await agent.put(api.juices.liters(999999)).send({ liters: 1 }).expect(404)
  })

  // --- Added boundary/status/shape tests ---

  it('exactly 0 liters derives status OUT', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]

    const res = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: 0 })
      .expect(200)

    expect(res.body.currentLiters).toBe(0)
    expect(res.body.status).toBe('OUT')
  })

  it('exactly parLiters derives status OK', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]

    const res = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: j0.parLiters })
      .expect(200)

    expect(res.body.currentLiters).toBeCloseTo(j0.parLiters)
    expect(res.body.status).toBe('OK')
  })

  it('accepts the upper bound 30 liters', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]

    const res = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: 30 })
      .expect(200)

    expect(res.body.currentLiters).toBe(30)
    expect(typeof res.body.status).toBe('string') // exact status depends on parLiters
  })

  it('response includes expected shape/fields', async () => {
    const list = await agent.get(api.juices.list()).expect(200)
    const j0 = list.body[0]

    const { body } = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: j0.parLiters })
      .expect(200)

    // required fields present
    for (const key of ['id', 'name', 'parLiters', 'currentLiters', 'status', 'lastUpdated']) {
      expect(body).toHaveProperty(key)
    }
    // types look sane
    expect(typeof body.id).toBe('number')
    expect(typeof body.name).toBe('string')
    expect(typeof body.parLiters).toBe('number')
    expect(typeof body.currentLiters).toBe('number')
    expect(typeof body.status).toBe('string')
    expect(Number.isFinite(Date.parse(body.lastUpdated))).toBe(true)
  })
})
