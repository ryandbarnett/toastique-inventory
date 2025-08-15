// lib/status.js
import { ONE_DAY_MS } from './config.js'

export function computeJuiceStatus(juiceRow, activeBatches, latestCount, now) {
  const currentLiters = activeBatches.reduce(
    (sum, b) => sum + (Number(b.remainingLiters) || 0), 0
  )

  const batches = activeBatches.map((b, idx) => ({
    id: b.id,
    madeAt: b.madeAt,
    expiresAt: b.expiresAt,
    remainingLiters: b.remainingLiters,
    isPrimary: idx === 0
  }))

  // If there are no active batches, treat as “expires soon” (you’re effectively out)
  let lastAvailableExpiresSoon = true
  if (activeBatches.length > 0) {
    const latestExpiryISO = activeBatches.reduce(
      (maxISO, b) => (new Date(b.expiresAt) > new Date(maxISO) ? b.expiresAt : maxISO),
      activeBatches[0].expiresAt
    )
    lastAvailableExpiresSoon = (new Date(latestExpiryISO).getTime() - now.getTime()) <= ONE_DAY_MS
  }

  const belowPar = currentLiters < juiceRow.parLiters
  const needToMake = belowPar || lastAvailableExpiresSoon

  return {
    id: juiceRow.id,
    name: juiceRow.name,
    parLiters: juiceRow.parLiters,

    // batch-aware
    currentLiters,
    batches,
    lastAvailableExpiresSoon,
    needToMake,
    belowPar,

    // keep daily-count fields (compat)
    countLiters: latestCount ? latestCount.countLiters : null,
    countedAt: latestCount ? latestCount.countedAt : null
  }
}
