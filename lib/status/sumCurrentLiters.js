// lib/status/sumCurrentLiters.js
/** Sum remaining liters across batches (defensive against bad data). */
export default function sumCurrentLiters(activeBatches) {
  return activeBatches.reduce((sum, b) => sum + (Number(b.remainingLiters) || 0), 0)
}
