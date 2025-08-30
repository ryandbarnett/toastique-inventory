// tests/auth.users.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/auth/users', () => {
  let api
  beforeEach(async () => { api = await makeApi({ seed: true }) })

  it('returns an array of {id,name} for all users, sorted by name', async () => {
    const res = await api.get('/api/auth/users').expect(200)

    // shape
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)

    for (const u of res.body) {
      expect(u).toHaveProperty('id')
      expect(typeof u.id).toBe('number')
      expect(u.id).toBeGreaterThan(0)

      expect(u).toHaveProperty('name')
      expect(typeof u.name).toBe('string')
      expect(u.name.length).toBeGreaterThan(0)

      // no secrets
      expect(u).not.toHaveProperty('pin_hash')
    }

    // sorted by name (A→Z)
    const names = res.body.map(u => u.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })
})
