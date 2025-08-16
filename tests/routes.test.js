import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { makeTestDb, seedJuices } from './helpers/testDb.js'
import * as repo from '../lib/repo.js'

let app, db
repo.getDb = async () => db

beforeEach(async () => {
  db = await makeTestDb()
  await seedJuices(db)
  app = createApp()
})

describe('GET /api/juices', () => {
  it('returns juices with status fields', async () => {
    const res = await request(app).get('/api/juices')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('parLiters')
    expect(res.body[0]).toHaveProperty('currentLiters')
  })
})

describe('POST /api/juices/:id/batches', () => {
  it('creates a batch', async () => {
    const res = await request(app)
      .post('/api/juices/1/batches')
      .send({ volumeLiters: 3 })
    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.batch).toHaveProperty('id')
  })
})

describe('PATCH /api/batches/:id', () => {
  it('updates a batch', async () => {
    const created = await request(app).post('/api/juices/1/batches').send({ volumeLiters: 2 })
    const id = created.body.batch.id
    const res = await request(app).patch(`/api/batches/${id}`).send({ remainingLiters: 1.2 })
    expect(res.status).toBe(200)
    expect(res.body.batch.remainingLiters).toBeCloseTo(1.2)
  })
})

describe('POST /api/juices/:id/counts', () => {
  it('records today’s count', async () => {
    const res = await request(app).post('/api/juices/1/counts').send({ countLiters: 2.5 })
    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.countDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
