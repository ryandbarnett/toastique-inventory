// lib/status/normalizeBatches.js
/** Normalize batches for the UI and mark the newest as primary (idx 0). */
export default function normalizeBatches(activeBatches) {
  return activeBatches.map((b, idx) => ({
    id: b.id,
    madeAt: b.madeAt,
    expiresAt: b.expiresAt,
    remainingLiters: b.remainingLiters,
    isPrimary: idx === 0
  }))
}
