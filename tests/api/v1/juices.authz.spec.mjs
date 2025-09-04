// tests/api/v1/juices.authz.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { createTestAgent, api } from '../../helpers/app.mjs'
import { loginAs } from '../../helpers/auth.mjs'

describe('Authz on write routes', () => {
  let agent
  beforeEach(async () => { agent = createTestAgent({ seed: true }) })

  it('PUT /api/v1/juices/:id/liters → 401 when not logged in', async () => {
    await agent
      .put(api.juices.liters(1))
      .send({ liters: 5 })
      .expect(401)
  })

  it('PUT /api/v1/juices/:id/liters → 200 when logged in', async () => {
    await loginAs(agent, 1)
    
    const res = await agent
      .put(api.juices.liters(1))
      .send({ liters: 5 })
      .expect(200)

    expect(res.body).toHaveProperty('currentLiters', 5)
  })
})
