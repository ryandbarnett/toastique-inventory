// lib/repo/juices.js
export function makeJuicesRepo(db) {
  return {
    listAll() {
      return db.prepare(`
        SELECT id, name, parLiters, currentLiters, lastUpdated
        FROM juices
        ORDER BY id ASC
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

    updateLiters(id, liters, nowISO) {
      return db.prepare(`
        UPDATE juices
           SET currentLiters = ?, lastUpdated = ?
         WHERE id = ?
      `).run(liters, nowISO, id)
    }
  }
}
