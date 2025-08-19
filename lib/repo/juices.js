import { getDb } from '../../utils/db.js'

export async function listJuicesOrdered() {
  const db = await getDb()
  return db.all(`
    SELECT id, name, par_liters AS parLiters, display_order AS displayOrder
    FROM juices
    ORDER BY display_order ASC
  `)
}

export async function getJuiceById(id) {
  const db = await getDb()
  return db.get(`
    SELECT id, name, par_liters AS parLiters
    FROM juices WHERE id = ?
  `, [id])
}
