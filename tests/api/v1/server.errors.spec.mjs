// tests/api/v1/server.errors.spec.mjs
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { buildApp, api } from '../../helpers/app.mjs'

describe('server: 404s, validation, auth, and error middleware', () => {
  let app
  let agent

  beforeAll(async () => {
    app = buildApp({ seed: true })
    agent = request.agent(app)

    const userId = 1
    const pin = '1234'

    await agent.post(api.auth.begin()).send({ userId }).expect(200)
    await agent.post(api.auth.setPin()).send({ userId, pin, confirm: pin }).expect(200)

    const me = await agent.get(api.auth.me()).expect(200)
    expect(me.body).toEqual({
      authenticated: true,
      user: expect.objectContaining({ id: userId, name: expect.any(String) }),
    })
  })

  it('returns 401 when not authenticated', async () => {
    await request(app)
      .put(api.juices.liters(1))
      .send({ liters: 1 })
      .expect(401)
  })

  it('returns 404 when id is not an integer', async () => {
    const res = await agent
      .put(api.juices.liters('abc'))
      .send({ liters: 1 })
      .expect(404)
    expect(res.body).toMatchObject({ error: 'Not Found' })
  })

  it('returns 404 when juice does not exist', async () => {
    const res = await agent
      .put(api.juices.liters(99999))
      .send({ liters: 1 })
      .expect(404)
    expect(res.body).toMatchObject({ error: 'Not Found' })
  })

  it('returns 400 on invalid liters payload', async () => {
    const res = await agent
      .put(api.juices.liters(1))
      .send({ liters: 'NaN' })
      .expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('malformed JSON triggers error middleware (500 JSON)', async () => {
    const res = await agent
      .post(api.juices.liters(1))
      .set('Content-Type', 'application/json')
      .send('{"badJson":')
      .expect(500)
    expect(res.body).toMatchObject({ error: 'Internal Server Error' })
  })
})
