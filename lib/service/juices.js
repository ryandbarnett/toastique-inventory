// lib/service/juices.js
export function withStatus(row) {
  if (row.currentLiters <= 0) return { ...row, status: 'OUT' }
  if (row.currentLiters >= row.parLiters) return { ...row, status: 'OK' }
  return { ...row, status: 'BELOW PAR' }
}

export const MAX_LITERS = 30

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
