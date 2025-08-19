// lib/service/validators/parse.js
export function validateDateLike(value, what = 'date') {
  const d = value instanceof Date ? value : new Date(value)
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    throw new Error(`${what} must be a valid date`)
  }
  return d
}

export function parseMadeDateOrNow(madeAt) {
  const d = madeAt ? new Date(madeAt) : new Date()
  if (Number.isNaN(d.getTime())) {
    throw new Error('madeAt must be a valid date or omitted')
  }
  return d
}

export function coerceRemainingLitersOrNull(value) {
  if (value == null) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('remainingLiters must be a number >= 0')
  }
  return n
}