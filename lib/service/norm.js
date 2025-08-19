// lib/service/norm.js
import { validateDateLike } from './validators/parse.js'

/** Normalize liters to a fixed precision (default 3 dp) and coerce to Number. */
export function normalizeLiters(n, digits = 3) {
  const x = Number(n)
  if (!Number.isFinite(x)) throw new Error('Liters must be a finite number')
  return Number(x.toFixed(digits))
}

/** Normalize disposedAt into: {kind:'unset'|'now'|'null'|'date', date?} */
export function normalizeDisposedAt(disposedAt) {
  if (disposedAt === undefined) return { kind: 'unset' }
  if (disposedAt === true)      return { kind: 'now' }
  if (disposedAt === null)      return { kind: 'null' }
  const date = validateDateLike(disposedAt, 'disposedAt')
  return { kind: 'date', date }
}

/** Normalize note strings: trim whitespace, store null for empty. */
export function normalizeNote(note) {
  return note?.trim() ? note.trim() : null
}