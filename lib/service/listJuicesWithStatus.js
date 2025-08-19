// lib/service/listJuicesWithStatus.js
import { listJuicesOrdered, getLatestCountsMap, listActiveBatches } from '../repo/index.js'
import { computeJuiceStatus } from '../status/index.js'

// ——— helpers (file‑private) ———
function getClock() {
  const now = new Date()
  const nowISO = now.toISOString()
  const today = nowISO.slice(0, 10)
  return { now, nowISO, today }
}

async function buildStatusRow(juice, { now, nowISO, latestMap }) {
  const active = await listActiveBatches(juice.id, nowISO)
  return computeJuiceStatus(juice, active, latestMap.get(juice.id), now)
}

// ——— public API ———
export default async function listJuicesWithStatus() {
  const { now, nowISO, today } = getClock()

  const juices = await listJuicesOrdered()
  const latestMap = await getLatestCountsMap(today)

  const rows = []
  for (const j of juices) {
    rows.push(await buildStatusRow(j, { now, nowISO, latestMap }))
  }
  return rows
}