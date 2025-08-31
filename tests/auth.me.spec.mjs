// tests/auth.me.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/auth/me', () => {
  let api

  beforeEach(async () => {
    api = await makeApi({ seed: true })
  })

  it('returns authenticated=false when not logged in', async () => {
    const res = await api.get('/api/auth/me').expect(200)
    expect(res.body).toEqual({ authenticated: false, user: null })
  })

  it('returns authenticated=true and user after first-time set-pin (session started)', async () => {
    const userId = 1

    // Ensure user exists
    await api.post('/api/auth/begin').send({ userId }).expect(200)

    // First-time set PIN -> should also start a session
    await api.post('/api/auth/set-pin')
      .send({ userId, pin: '1234', confirm: '1234' })
      .expect(200)

    // Now /me should reflect authenticated session
    const res = await api.get('/api/auth/me').expect(200)
    expect(res.body).toEqual({
      authenticated: true,
      user: expect.objectContaining({
        id: userId,
        name: expect.any(String),
      }),
    })
  })
})
