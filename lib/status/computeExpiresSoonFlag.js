// lib/status/computeExpiresSoonFlag.js
import { ONE_DAY_MS } from '../config.js'

/**
 * Compute whether the last available juice expires within the threshold.
 * Current behavior: uses the LATEST expiry across batches.
 */
export default function computeExpiresSoonFlag(activeBatches, now, thresholdMs = ONE_DAY_MS) {
  if (activeBatches.length === 0) return true // effectively out

  // Choose the latest expiry (furthest out) per the original logic.
  const latestExpiryISO = activeBatches.reduce(
    (maxISO, b) => (new Date(b.expiresAt) > new Date(maxISO) ? b.expiresAt : maxISO),
    activeBatches[0].expiresAt
  )
  const msUntilLatest = new Date(latestExpiryISO).getTime() - now.getTime()
  return msUntilLatest <= thresholdMs
}
