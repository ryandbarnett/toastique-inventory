// lib/repo/batches.js
/// <reference path="../types.js" />

/** @typedef {import('../types.js').Batch} Batch */

import { FIELD_MAP, buildSetClause } from './_shared.js'
import { BATCHES_SQL as SQL } from './sql/index.js'

export function makeBatchesRepo(getDb) {
  async function listActiveBatches(juiceId, nowISO) {
    const db = await getDb()
    return db.all(SQL.listActiveBatches, [juiceId, nowISO])
  }

  async function insertBatch(juiceId, { liters, madeISO, expiresISO, note }) {
    const db = await getDb()
    const result = await db.run(SQL.insertBatch, [
      juiceId, madeISO, expiresISO, liters, liters, null, note ?? null
    ])
    return getBatchById(result.lastID)
  }

  async function getBatchById(batchId) {
    const db = await getDb()
    return db.get(SQL.getBatchById, [batchId])
  }

  /**
   * New safe patcher (whitelisted).
   */
  async function updateBatch(batchId, patch = {}) {
    const db = await getDb()
    const { setSql, args } = buildSetClause(patch, FIELD_MAP.batchUpdatable)
    if (!setSql) return getBatchById(batchId)
    await db.run(`UPDATE juice_batches SET ${setSql} WHERE id = ?`, [...args, batchId])
    return getBatchById(batchId)
  }

  return { listActiveBatches, insertBatch, getBatchById, updateBatch }
}
