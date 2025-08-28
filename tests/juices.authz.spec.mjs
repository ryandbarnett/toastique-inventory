// tests/juices.authz.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('Authz on write routes', () => {
  let api
  beforeEach(async () => { api = await makeApi({ seed: true }) })

  it('PUT /api/juices/:id/liters → 401 when not logged in', async () => {
    await api.put('/api/juices/1/liters')
      .send({ liters: 5 })
      .expect(401)
  })

  it('PUT /api/juices/:id/liters → 200 when logged in', async () => {
    // first-time set pin for user 1 (starts session)
    await api.post('/api/auth/begin').send({ userId: 1 }).expect(200)
    await api.post('/api/auth/set-pin')
      .send({ userId: 1, pin: '1234', confirm: '1234' })
      .expect(200)

    const res = await api.put('/api/juices/1/liters')
      .send({ liters: 5 })
      .expect(200)

    expect(res.body).toHaveProperty('currentLiters', 5)
  })
})
