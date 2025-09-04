import { describe, it, expect } from 'vitest'
import { createTestAgent } from '../../helpers/app.mjs'

describe('Auth login rate-limit', () => {
  it('locks quickly with test thresholds', async () => {
    // Use faster thresholds for tests
    const agent = createTestAgent({
      authSecurity: { maxTries: 2, windowMs: 1000, lockMs: 2000 },
    })

    // Pick a user and set a real PIN
    const usersRes = await agent.get('/api/auth/users').expect(200)
    const user = usersRes.body[0]

    await agent.post('/api/auth/set-pin').send({
      userId: user.id, pin: '1234', confirm: '1234'
    }).expect(200)

    // Wrong attempts until lock
    await agent.post('/api/auth/login').send({ userId: user.id, pin: '0000' }).expect(401)
    await agent.post('/api/auth/login').send({ userId: user.id, pin: '0000' }).expect(401)

    // Now locked
    const locked = await agent.post('/api/auth/login').send({ userId: user.id, pin: '1234' })
    expect(locked.status).toBe(429)
    expect(locked.body).toEqual({ error: 'Too many attempts. Try again later.' })
  })
})
