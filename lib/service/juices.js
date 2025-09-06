// lib/service/juices.js
// --- Status enrichment ---
export function withStatus(row) {
  if (row.currentLiters <= 0) return { ...row, status: 'OUT' }
  if (row.currentLiters >= row.parLiters) return { ...row, status: 'OK' }
  return { ...row, status: 'BELOW PAR' }
}

export const MAX_LITERS = 30
export const MAX_PAR_LITERS = 10

// --- Sorting helpers we can reuse anywhere (API, admin UI, etc.) ---
export const STATUS_RANK = { 'OUT': 0, 'BELOW PAR': 1, 'OK': 2 }
export function compareByStatusThenName(a, b) {
  return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) || a.name.localeCompare(b.name)
}

function parseSort(q) { return q === 'status' ? 'status' : 'name' }
function parseDir(q)  { return q === 'desc'   ? 'desc'   : 'asc' }

/**
+ * listJuices: repo → enrich with status → sort → return
+ * Accepts untrusted sort/dir and sanitizes internally.
+ */
export function listJuices({ repo, sort, dir }) {
  const rows = repo.listAll()
  const enriched = rows.map(withStatus)
  const s = parseSort(sort)
  const d = parseDir(dir)
  const byName = (a, b) => a.name.localeCompare(b.name)
  const cmp = s === 'status' ? compareByStatusThenName : byName
  enriched.sort(cmp)
  if (d === 'desc') enriched.reverse()
  return enriched
}

/*
  * updateJuiceLiters: validates input, checks existence, updates, and returns hydrated row.
  * Returns a plain object you can send back to the client.
*/
export function updateJuiceLiters({ repo, users, id, liters, userId, now = new Date().toISOString() }) {
  // basic id sanity — keep the route's 404 behavior consistent
  if (!Number.isInteger(id)) {
    return { error: 404, body: { error: 'Not Found' } }
  }

  const v = validateLiters(liters)
  if (!v.ok) {
    return { error: 400, body: { error: v.message } }
  }

  const exists = repo.exists(id)
  if (!exists) {
    return { error: 404, body: { error: 'Not Found' } }
  }

  repo.updateLiters(id, liters, userId, now)
  const updated = repo.getById(id)
  // ensure returned object matches the update exactly
  updated.lastUpdated = now
  // hydrate friendly name (repo.listAll already joins, but getById doesn’t)
  updated.updatedByName = users.getNameById(userId)

  return { ok: true, body: withStatus(updated) }
}


export function validateLiters(liters) {
  const ok = (
    typeof liters === 'number' &&
    Number.isFinite(liters) &&
    liters >= 0 &&
    liters <= MAX_LITERS
  )
  if (!ok) {
    return {
      ok: false,
      message: `liters must be a finite number between 0 and ${MAX_LITERS}`
    }
  }
  return { ok: true }
}

export function validatePar(n) {
  const ok = (
    typeof n === 'number' &&
    Number.isFinite(n) &&
    n >= 0 &&
    n <= MAX_PAR_LITERS
  )
  if (!ok) {
    return {
      ok: false,
      message: `parLiters must be a finite number between 0 and ${MAX_PAR_LITERS}`
    }
  }
  // normalize to 0.5 steps (optional)
  const value = Math.round(n * 2) / 2
  return { ok: true, value }
}

/**
  * setPar: validates input, checks existence, updates, returns hydrated row
  */
export function setPar({ repo, users, id, parLiters, userId, now = new Date().toISOString() }) {
  if (!Number.isInteger(id)) {
    return { error: 404, body: { error: 'Not Found' } }
  }
  const v = validatePar(parLiters)
  if (!v.ok) {
    return { error: 400, body: { error: v.message } }
  }
  const exists = repo.exists(id)
  if (!exists) {
    return { error: 404, body: { error: 'Not Found' } }
  }
  repo.updatePar(id, v.value, userId, now)
  const updated = repo.getById(id)
  updated.lastUpdated = now
  updated.updatedByName = users.getNameById(userId)
  return { ok: true, body: withStatus(updated) }
}
