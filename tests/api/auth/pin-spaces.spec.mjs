// tests/auth.pin-spaces.spec.mjs
import { describe, it, expect } from 'vitest'
import { createTestAgent as makeApi } from '../../helpers/app.mjs'

describe('auth PIN normalization', () => {
  it('accepts surrounding spaces (set-pin -> login)', async () => {
    const api = await makeApi({ seed: true })
    const { body: users } = await api.get('/api/auth/users').expect(200)
    const userId = users[0].id

    await api.post('/api/auth/set-pin')
      .send({ userId, pin: ' 1234 ', confirm: '1234 ' })
      .expect(200)

    await api.post('/api/auth/login')
      .send({ userId, pin: ' 1234 ' })
      .expect(200)
  })
})
