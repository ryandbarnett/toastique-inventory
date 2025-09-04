import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'
import { loginAs } from './auth/helpers.mjs'

describe('Juices "updated by"', () => {
  let api
  beforeEach(async () => {
    api = await makeApi({ seed: true })
    await loginAs(api) // establishes a session
  })

  it('records updater on PUT and returns updatedByName (PUT + list)', async () => {
    // who am I logged in as?
    const me = await api.get('/api/auth/me').expect(200)
    const meName = me.body?.user?.name
    expect(typeof meName).toBe('string')

    // pick a juice
    const listBefore = await api.get('/api/v1/juices').expect(200)
    const j0 = listBefore.body[0]

    // update liters (even same value is fine; we stamp updated_by)
    const putRes = await api
      .put(`/api/v1/juices/${j0.id}/liters`)
      .send({ liters: j0.currentLiters })
      .expect(200)

    // PUT response is hydrated
    expect(putRes.body).toHaveProperty('updatedByName')
    expect(putRes.body.updatedByName).toBe(meName)

    // fetch again and verify updatedByName
    const listAfter = await api.get('/api/v1/juices').expect(200)
    const refreshed = listAfter.body.find(x => x.id === j0.id)
    expect(refreshed).toBeTruthy()
    expect(refreshed.updatedByName).toBe(meName)
  })
})
