// tests/routes.inventory.int.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let testDb

// Ensure routes use our in-memory DB
vi.mock('../utils/db.js', () => ({
  getDb: async () => testDb
}))

const makeApp = (router) => {
  const app = express()
  app.use(express.json())
  app.use('/', router)
  return app
}

describe('Inventory routes (integration)', () => {
  let app

  beforeEach(async () => {
    // Fresh in-memory DB for each test
    testDb = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    })
    await testDb.exec(`
      CREATE TABLE inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL DEFAULT 0,
        unit TEXT NOT NULL,
        lastUpdated TEXT NOT NULL,
        par INTEGER
      );
    `)

    // Import router after mock + DB ready
    const mod = await import('../routes/inventory.js')
    const router = mod.default || mod
    app = makeApp(router)
  })

  afterEach(async () => {
    if (testDb) await testDb.close()
    testDb = null
  })

  describe('POST /items', () => {
    it('succeeds with par and persists it', async () => {
      const payload = { name: 'Flour', quantity: '5', unit: 'lbs', par: '3' }
      const res = await request(app).post('/items').send(payload)
      expect(res.status === 200 || res.status === 201).toBe(true)
      expect(res.body).toMatchObject({
        name: 'Flour',
        quantity: 5,
        unit: 'lbs',
        par: 3
      })

      const row = await testDb.get(
        'SELECT name, quantity, unit, par FROM inventory WHERE name=?',
        ['Flour']
      )
      expect(row).toMatchObject({ name: 'Flour', quantity: 5, unit: 'lbs', par: 3 })
    })

    it('accepts decimal par and persists it as a number', async () => {
      const created = await request(app).post('/items').send({
        name: 'Olive Oil',
        quantity: 2,
        unit: 'L',
        par: '3.5'
      })
      expect(created.status === 200 || created.status === 201).toBe(true)
      expect(created.body.par).toBe(3.5)

      const row = await testDb.get('SELECT par FROM inventory WHERE id=?', [created.body.id])
      expect(row.par).toBe(3.5)
    })

    it('fails when par is missing', async () => {
      const res = await request(app).post('/items').send({ name: 'Oil', quantity: 1, unit: 'gal' })
      expect(res.status).toBe(400)
      expect(res.body?.error || '').toMatch(/par is required/i)
    })
  })

  describe('PATCH /items/:id', () => {
    it('updates par and persists', async () => {
      const created = await request(app)
        .post('/items')
        .send({ name: 'Sugar', quantity: 2, unit: 'lbs', par: 1 })
      const id = created.body.id

      const res = await request(app).patch(`/items/${id}`).send({ par: 4 })
      expect(res.status).toBe(200)
      expect(res.body.par).toBe(4)

      const row = await testDb.get('SELECT par FROM inventory WHERE id=?', [id])
      expect(row.par).toBe(4)
    })

    it('updates lastUpdated when changing par', async () => {
      const created = await request(app).post('/items').send({
        name: 'Sugar',
        quantity: 2,
        unit: 'lbs',
        par: 1
      })
      const id = created.body.id
      const before = created.body.lastUpdated
      expect(before).toBeTruthy()

      const patched = await request(app).patch(`/items/${id}`).send({ par: 4 })
      expect(patched.status).toBe(200)
      expect(patched.body.par).toBe(4)
      expect(patched.body.lastUpdated).toBeTruthy()
      expect(patched.body.lastUpdated).not.toBe(before)
    })

    it('fails for negative par', async () => {
      const created = await request(app)
        .post('/items')
        .send({ name: 'Salt', quantity: 0, unit: 'lbs', par: 0 })
      const id = created.body.id

      const res = await request(app).patch(`/items/${id}`).send({ par: -1 })
      expect(res.status).toBe(400)
      expect(res.body?.error || '').toMatch(/≥\s*0/)
    })
  })
})
