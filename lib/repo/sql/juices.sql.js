// lib/repo/sql/juices.sql.js
export const SQL = {
  listJuicesOrdered: `
    SELECT id, name, par_liters AS parLiters, display_order AS displayOrder
    FROM juices
    ORDER BY display_order ASC
  `,
  getJuiceById: `
    SELECT id, name, par_liters AS parLiters
    FROM juices WHERE id = ?
  `,
}
