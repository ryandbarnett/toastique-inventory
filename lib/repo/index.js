// lib/repo/index.js
import { makeBatchesRepo } from './batches.js'
import { makeCountsRepo } from './counts.js'
import { makeJuicesRepo } from './juices.js'
import { getDb } from '../../utils/db.js'

/**
 * Build a repo bound to a DB getter.
 * @param {{ getDb?: () => Promise<import('../../utils/db.js').DB> }} deps
 */
export function makeRepo(deps = {}) {
  const _getDb = deps.getDb ?? getDb
  return {
    batches: makeBatchesRepo(_getDb),
    counts:  makeCountsRepo(_getDb),
    juices:  makeJuicesRepo(_getDb),
  }
}

// ⛔️ No singletons or named pass‑through exports.
// Always call makeRepo(...) and use repo.batches / repo.counts / repo.juices.
