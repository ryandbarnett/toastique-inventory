/// <reference path="../types.js" />

/**
 * @typedef {import('../types.js').CountRecord} CountRecord
 */

import { COUNTS_SQL as SQL } from './sql/index.js'

/**
 * Factory for counts repository.
 * @param {() => Promise<import('../../utils/db.js').DB>} getDb
 */
export function makeCountsRepo(getDb) {
  /**
   * Returns a Map keyed by juiceId with the latest count for a given `today` (YYYY‑MM‑DD).
   * @param {string} today
   * @returns {Promise<Map<number, Pick<CountRecord, 'juiceId'|'countLiters'|'countedAt'>>>}
   */
  async function getLatestCountsMap(today) {
    const db = await getDb()
    const latest = await db.all(SQL.getLatestCountsMap, [today])
    return new Map(latest.map(r => [r.juiceId, r]))
  }

  /**
   * Add a daily count entry for a juice.
   * @param {number} juiceId
   * @param {number} countLiters
   * @param {string|null} note
   * @returns {Promise<Pick<CountRecord, 'countedAt'|'countDate'>>}
   */
  async function addDailyCount(juiceId, countLiters, note) {
    const db = await getDb()
    const now = new Date()
    const counted_at = now.toISOString()
    const count_date = counted_at.slice(0, 10)
    await db.run(SQL.addDailyCount, [
      juiceId,
      countLiters,
      counted_at,
      count_date,
      note ?? null,
    ])
    return { countedAt: counted_at, countDate: count_date }
  }

  return { getLatestCountsMap, addDailyCount }
}
