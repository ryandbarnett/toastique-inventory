// lib/service/listJuicesWithStatus.js

/**
 * @param {{ juices:{listJuicesOrdered:Function}, counts:{getLatestCountsMap:Function} }} repo
 */
export function makeListJuicesWithStatus(repo) {
  return async function listJuicesWithStatus() {
    const juices = await repo.juices.listJuicesOrdered()
    const today = new Date().toISOString().slice(0, 10)
    const countsMap = await repo.counts.getLatestCountsMap(today)

    // API expects `currentLiters` (fallback to 0 if no count today)
    return juices.map(j => ({
      ...j,
      currentLiters: countsMap.get(j.id)?.countLiters ?? 0
    }))
  }
}
