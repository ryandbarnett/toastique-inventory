// tests/juices.authz.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'
import { loginAs } from './auth/helpers.mjs'

describe('Authz on write routes', () => {
  let api
  beforeEach(async () => { api = await makeApi({ seed: true }) })

  it('PUT /api/juices/:id/liters → 401 when not logged in', async () => {
    await api.put('/api/juices/1/liters')
      .send({ liters: 5 })
      .expect(401)
  })

  it('PUT /api/juices/:id/liters → 200 when logged in', async () => {
    await loginAs(api, 1)

    const res = await api.put('/api/juices/1/liters')
      .send({ liters: 5 })
      .expect(200)

    expect(res.body).toHaveProperty('currentLiters', 5)
  })
})
