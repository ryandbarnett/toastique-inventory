import { describe, it, expect } from 'vitest'
import request from 'supertest'

describe('server: env branches for SESSION_SECRET', () => {
  it('mounts with default dev-secret when SESSION_SECRET is unset', async () => {
    const old = process.env.SESSION_SECRET
    delete process.env.SESSION_SECRET
    const { createApp } = await import('../../server.js')
    const api = request(await createApp({ dbPath: ':memory:', seed: true }))
    // any request to ensure app initialized ok
    const res = await api.get('/api/auth/users').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    process.env.SESSION_SECRET = old
  })

  it('mounts with provided SESSION_SECRET', async () => {
    const old = process.env.SESSION_SECRET
    process.env.SESSION_SECRET = 'test-secret'
    const { createApp } = await import('../../server.js')
    const api = request(await createApp({ dbPath: ':memory:', seed: true }))
    const res = await api.get('/api/auth/users').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    process.env.SESSION_SECRET = old
  })
})
