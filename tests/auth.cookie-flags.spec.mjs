import { describe, it, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

function getCookieString(setCookieHeader) {
  return Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
}

function getCookieName(setCookieHeader) {
  const cookieStr = getCookieString(setCookieHeader)
  return cookieStr.split(';', 1)[0].split('=')[0]
}

describe('session cookie flags', () => {
  it('sets HttpOnly, SameSite=Lax, Path=/', async () => {
    const api = await makeApi({ seed: true })
    const { body: users } = await api.get('/api/auth/users').expect(200)
    const userId = users[0].id

    // Session is first established on set-pin (startSession is called there)
    const setRes = await api.post('/api/auth/set-pin')
      .send({ userId, pin: '1234', confirm: '1234' })
      .expect(200)

    const rawHeader = setRes.headers['set-cookie']
    expect(rawHeader).toBeDefined()

    const cookieName = getCookieName(rawHeader).toLowerCase()
    // Allow either "sid" or "toastique.sid"
    expect(cookieName.endsWith('sid')).toBe(true)

    const lc = getCookieString(rawHeader).toLowerCase()
    expect(lc).toContain('httponly')
    expect(lc).toContain('path=/')
    expect(lc).toContain('samesite=lax')
    // In test env, secure is false
    expect(lc).not.toContain('secure')

    // sanity: login still works
    await api.post('/api/auth/login')
      .send({ userId, pin: '1234' })
      .expect(200)
  })
})
