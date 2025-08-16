// tests/helpers/testDb.js
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { initSchema } from '../../utils/initSchema.js'

export async function makeTestDb() {
  const db = await open({ filename: ':memory:', driver: sqlite3.Database })
  await initSchema(db)
  return db
}

export async function seedJuices(db) {
  await db.exec(`
    INSERT INTO juices (id, name, par_liters, display_order) VALUES
      (1, 'Balance', 6, 1),
      (2, 'Recharge', 6, 2),
      (3, 'Metabolize', 6, 3);
  `)
}
