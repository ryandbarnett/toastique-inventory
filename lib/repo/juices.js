/// <reference path="../types.js" />

/**
 * @typedef {import('../types.js').Juice} Juice
 */

import { JUICES_SQL as SQL } from './sql/index.js'

/**
 * Factory for juices repository.
 * @param {() => Promise<import('../../utils/db.js').DB>} getDb
 */
export function makeJuicesRepo(getDb) {
  /**
   * List juices in display order.
   * @returns {Promise<Juice[]>}
   */
  async function listJuicesOrdered() {
    const db = await getDb()
    return db.all(SQL.listJuicesOrdered)
  }

  /**
   * Get a single juice by id.
   * @param {number} id
   * @returns {Promise<Pick<Juice,'id'|'name'|'parLiters'>|null>}
   */
  async function getJuiceById(id) {
    const db = await getDb()
    return db.get(SQL.getJuiceById, [id])
  }

  return { listJuicesOrdered, getJuiceById }
}
