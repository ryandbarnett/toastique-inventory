// lib/repo/users.mjs
export function makeUserRepo(db) {
  const getById    = db.prepare('SELECT id, name, pin_hash FROM users WHERE id = ?')
  const list       = db.prepare('SELECT id, name FROM users ORDER BY name ASC')
  const setPinHash = db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?')
  const getNameByIdStmt = db.prepare('SELECT name FROM users WHERE id = ?')

  return {
    findById(id) { return getById.get(id) ?? null },
    listUsers()  { return list.all() },
    setPinHash(id, hash) { setPinHash.run(hash, id) },
    getNameById(id) { const r = getNameByIdStmt.get(id); return r?.name ?? null },
  }
}
