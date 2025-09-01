// lib/repo/juices.js
export function makeJuicesRepo(db) {
  return {
    listAll() {
      return db.prepare(`
        SELECT j.id,
        j.name,
        j.parLiters,
        j.currentLiters,
        j.lastUpdated,
        u.name AS updatedByName
        FROM juices j
        LEFT JOIN users u ON u.id = j.updated_by
        ORDER BY j.id ASC
      `).all()
    },

    getById(id) {
      return db.prepare(`
        SELECT id, name, parLiters, currentLiters, lastUpdated
        FROM juices
        WHERE id = ?
      `).get(id)
    },

    exists(id) {
      return db.prepare(`SELECT id FROM juices WHERE id = ?`).get(id)
    },

    updateLiters(id, liters, userId, nowISO) {
      return db.prepare(`
        UPDATE juices
        SET currentLiters = ?, lastUpdated = ?, updated_by = ?
        WHERE id = ?
      `).run(liters, nowISO, userId, id)
    }
  }
}
