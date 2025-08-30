// tests/auth.me.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/auth/me', () => {
  let api

  beforeEach(async () => {
    api = await makeApi({ seed: true })
  })

  it('401 when not logged in', async () => {
    await api.get('/api/auth/me').expect(401)
  })

  it('200 after first-time set-pin (session started)', async () => {
    const userId = 1

    // Begin (mostly to assert the user exists)
    await api.post('/api/auth/begin').send({ userId }).expect(200)

    // First-time set PIN → should also start a session
    await api.post('/api/auth/set-pin')
      .send({ userId, pin: '1234', confirm: '1234' })
      .expect(200)

    // Now me should be populated
    const me = await api.get('/api/auth/me').expect(200)
    expect(me.body).toEqual(
      expect.objectContaining({
        id: userId,
        name: expect.any(String),
      })
    )
  })
})
