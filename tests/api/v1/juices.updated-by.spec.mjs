// tests/api/v1/juices.updated-by.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { createTestAgent, api } from '../../helpers/app.mjs'
import { loginAs } from '../../helpers/auth.mjs'

describe('Juices "updated by"', () => {
  let agent
  beforeEach(async () => {
    agent = createTestAgent({ seed: true })
    await loginAs(agent) // establishes a session
  })

  it('records updater on PUT and returns updatedByName (PUT + list)', async () => {
    // who am I logged in as?
    const me = await agent.get(api.auth.me()).expect(200)
    const meName = me.body?.user?.name
    expect(typeof meName).toBe('string')

    // pick a juice
    const listBefore = await agent.get(api.juices.list()).expect(200)
    const j0 = listBefore.body[0]

    // update liters (even same value is fine; we stamp updated_by)
    const putRes = await agent
      .put(api.juices.liters(j0.id))
      .send({ liters: j0.currentLiters })
      .expect(200)

    // PUT response is hydrated
    expect(putRes.body).toHaveProperty('updatedByName')
    expect(putRes.body.updatedByName).toBe(meName)

    // fetch again and verify updatedByName
    const listAfter = await agent.get(api.juices.list()).expect(200)
    const refreshed = listAfter.body.find(x => x.id === j0.id)
    expect(refreshed).toBeTruthy()
    expect(refreshed.updatedByName).toBe(meName)
  })
})
