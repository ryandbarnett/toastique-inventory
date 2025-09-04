// tests/auth.begin.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { createTestAgent as makeApi } from '../../helpers/app.mjs'

describe('POST /api/auth/begin', () => {
  let api

  beforeEach(async () => {
    api = await makeApi({ seed: true }) // in-memory DB + seeded data
  })

  it('400 when userId is missing', async () => {
    const res = await api.post('/api/auth/begin').send({}).expect(400)
    expect(res.body.error).toBeTruthy()
  })

  it('404 when user is not found', async () => {
    const res = await api.post('/api/auth/begin').send({ userId: 999999 }).expect(404)
    expect(res.body.error).toBeTruthy()
  })

  it('needsPinSetup toggles from true → false after first-time set-pin', async () => {
    // Assume first seeded user has id = 1
    const userId = 1

    // Initially: no PIN set → begin says needsPinSetup = true
    const b1 = await api.post('/api/auth/begin').send({ userId }).expect(200)
    expect(b1.body).toMatchObject({ needsPinSetup: true })
    expect(typeof b1.body.name).toBe('string')

    // Set a PIN (first-time setup)
    await api.post('/api/auth/set-pin')
      .send({ userId, pin: '1234', confirm: '1234' })
      .expect(200)

    // Now: begin should say needsPinSetup = false
    const b2 = await api.post('/api/auth/begin').send({ userId }).expect(200)
    expect(b2.body).toMatchObject({ needsPinSetup: false })
    expect(b2.body.name).toBe(b1.body.name)
  })
})
