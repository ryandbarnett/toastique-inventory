// tests/auth.login-logout.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { createTestAgent as makeApi } from '../../helpers/app.mjs'

/**
 * Auth contract:
 * - Wrong PIN → 401 Unauthorized + { error: string }
 * - Correct PIN → 200 + { id, name }, session established
 * - /me reflects session; logout clears it (200 or 204 for now)
 */
describe('POST /api/auth/login & /api/auth/logout', () => {
  let api
  const userId = 1
  const pin = '1234'

  beforeEach(async () => {
    api = await makeApi({ seed: true })

    // ensure user exists and set a PIN (first-time setup)
    await api.post('/api/auth/begin').send({ userId }).expect(200)
    await api.post('/api/auth/set-pin').send({ userId, pin, confirm: pin }).expect(200)

    // if set-pin auto-starts a session, log out so we test login cleanly
    await api.post('/api/auth/logout').expect(res => {
      if (![200, 204].includes(res.status)) {
        throw new Error(`expected 200 or 204, got ${res.status}`)
      }
    })
  })

  it('rejects wrong PIN with 401 and generic error body', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ userId, pin: '9999' })
      .expect(401) // <-- strict: must be 401
    expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }))
  })

  it('accepts correct PIN and establishes a session; logout clears it', async () => {
    const loginRes = await api
      .post('/api/auth/login')
      .send({ userId, pin })
      .expect(200)

    expect(loginRes.body).toEqual(expect.objectContaining({ id: userId, name: expect.any(String) }))

    const meAfterLogin = await api.get('/api/auth/me').expect(200)
    expect(meAfterLogin.body).toEqual({
      authenticated: true,
      user: expect.objectContaining({ id: userId, name: expect.any(String) }),
    })

    await api.post('/api/auth/logout').expect(res => {
      if (![200, 204].includes(res.status)) {
        throw new Error(`expected 200 or 204, got ${res.status}`)
      }
    })

    const meAfterLogout = await api.get('/api/auth/me').expect(200)
    expect(meAfterLogout.body).toEqual({ authenticated: false, user: null })
  })
})
