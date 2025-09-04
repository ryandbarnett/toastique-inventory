import { describe, it, expect } from 'vitest'
import { createTestAgent, api } from '../../helpers/app.mjs'

describe('Auth hashing + happy path', () => {
  it('sets a PIN (hashed), logs in, and /me returns the user', async () => {
    const agent = createTestAgent()

    // Get a seeded user
    const usersRes = await agent.get('/api/auth/users').expect(200)
    expect(Array.isArray(usersRes.body)).toBe(true)
    const user = usersRes.body[0]

    // Begin → should indicate PIN setup required
    const begin = await agent.post(api.auth.begin()).send({ userId: user.id }).expect(200)
    expect(begin.body).toHaveProperty('needsPinSetup', true)

    // Set PIN
    await agent.post(api.auth.setPin()).send({
      userId: user.id,
      pin: '1234',
      confirm: '1234',
    }).expect(200)

    // Login
    await agent.post('/api/auth/login').send({
      userId: user.id,
      pin: '1234',
    }).expect(200)

    // /me shows authenticated user
    const me = await agent.get(api.auth.me()).expect(200)
    expect(me.body).toMatchObject({
      authenticated: true,
      user: { id: user.id, name: user.name },
    })
  })
})
