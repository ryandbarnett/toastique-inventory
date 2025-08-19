// lib/status/computeJuiceStatus.js
import sumCurrentLiters from './sumCurrentLiters.js'
import normalizeBatches from './normalizeBatches.js'
import computeExpiresSoonFlag from './computeExpiresSoonFlag.js'
import buildStatusPayload from './buildStatusPayload.js'

/** Public API: computeJuiceStatus (orchestrates helpers). */
export default function computeJuiceStatus(juiceRow, activeBatches, latestCount, now) {
  const currentLiters = sumCurrentLiters(activeBatches)
  const batches = normalizeBatches(activeBatches)
  const lastAvailableExpiresSoon = computeExpiresSoonFlag(activeBatches, now)
  return buildStatusPayload(juiceRow, batches, currentLiters, lastAvailableExpiresSoon, latestCount)
}
