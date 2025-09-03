// tests/server.errors.spec.mjs
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../server.js'

describe('server: 404s, validation, auth, and error middleware', () => {
  let app
  let agent  // persists cookies automatically across requests

  beforeAll(async () => {
    app = await createApp({ dbPath: ':memory:', seed: true })
    agent = request.agent(app) // <-- agent, not request(app)

    const userId = 1
    const pin = '1234'

    // First-time setup (your auth flow)
    await agent.post('/api/auth/begin').send({ userId }).expect(200)
    await agent.post('/api/auth/set-pin').send({ userId, pin, confirm: pin }).expect(200)

    // Sanity: we should now be authenticated for subsequent requests
    const me = await agent.get('/api/auth/me').expect(200)
    expect(me.body).toEqual({
      authenticated: true,
      user: expect.objectContaining({ id: userId, name: expect.any(String) }),
    })
  })

  it('returns 401 when not authenticated', async () => {
    // Use a fresh non-agent request to ensure no cookie is present
    await request(app).put('/api/juices/1/liters').send({ liters: 1 }).expect(401)
  })

  it('returns 404 when id is not an integer', async () => {
    const res = await agent
      .put('/api/juices/abc/liters') // invalid id
      .send({ liters: 1 })
      .expect(404)
    expect(res.body).toMatchObject({ error: 'Not Found' })
  })

  it('returns 404 when juice does not exist', async () => {
    const res = await agent
      .put('/api/juices/99999/liters') // non-existent juice
      .send({ liters: 1 })
      .expect(404)
    expect(res.body).toMatchObject({ error: 'Not Found' })
  })

  it('returns 400 on invalid liters payload', async () => {
    const res = await agent
      .put('/api/juices/1/liters')
      .send({ liters: 'NaN' }) // invalid
      .expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('malformed JSON triggers error middleware (500 JSON)', async () => {
    // express.json() runs before session; this exercises the 500 handler
    const res = await agent
      .post('/api/juices/1/liters')
      .set('Content-Type', 'application/json')
      .send('{"badJson":') // malformed JSON
      .expect(500)
    expect(res.body).toMatchObject({ error: 'Internal Server Error' })
  })
})
