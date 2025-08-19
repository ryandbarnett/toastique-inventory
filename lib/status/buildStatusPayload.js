// lib/status/buildStatusPayload.js
/** Below-PAR predicate. */
function isBelowPar(currentLiters, parLiters) {
  return currentLiters < parLiters
}

/** Assemble final status payload. */
export default function buildStatusPayload(juiceRow, batches, currentLiters, lastAvailableExpiresSoon, latestCount) {
  const belowPar = isBelowPar(currentLiters, juiceRow.parLiters)
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

    // daily-count (compat)
    countLiters: latestCount ? latestCount.countLiters : null,
    countedAt: latestCount ? latestCount.countedAt : null
  }
}
