// lib/service.js
import { QT_TO_L, YIELD_QT, iso, parseMultiplier } from './config.js'
import {
  listJuicesOrdered,
  getLatestCountsMap,
  listActiveBatches,
  getJuiceById,
  insertBatch,
  getBatchById,
  updateBatchRow,
  addDailyCount
} from './repo.js'
import { computeJuiceStatus } from './status.js'

export async function listJuicesWithStatus() {
  const now = new Date()
  const nowISO = now.toISOString()
  const today = nowISO.slice(0, 10)

  const juices = await listJuicesOrdered()
  const latestMap = await getLatestCountsMap(today)

  const rows = []
  for (const j of juices) {
    const active = await listActiveBatches(j.id, nowISO)
    rows.push(computeJuiceStatus(j, active, latestMap.get(j.id), now))
  }
  return rows
}

export async function addJuiceCount(juiceId, countLiters, note) {
  if (!Number.isFinite(juiceId) || !Number.isFinite(countLiters)) {
    throw new Error('id (param) and countLiters (body) must be numbers')
  }
  const juice = await getJuiceById(juiceId)
  if (!juice) throw new Error('Juice not found')
  return addDailyCount(juiceId, countLiters, note)
}

export async function createBatch(juiceId, { size, volumeLiters, madeAt, note }) {
  if (!Number.isFinite(juiceId)) throw new Error('Invalid juice id')

  const juice = await getJuiceById(juiceId)
  if (!juice) throw new Error('Juice not found')

  let liters = Number(volumeLiters)
  if (!Number.isFinite(liters) || liters <= 0) {
    const mult = parseMultiplier(size) ?? 1
    const baseQt = YIELD_QT[juice.name]
    if (!Number.isFinite(baseQt)) {
      throw new Error('volumeLiters is required for this juice (no recipe yield configured)')
    }
    liters = baseQt * mult * QT_TO_L
  }

  const made = madeAt ? new Date(madeAt) : new Date()
  if (Number.isNaN(made.getTime())) throw new Error('madeAt must be a valid date or omitted')
  const expires = new Date(made.getTime() + 5 * 24 * 60 * 60 * 1000)

  return insertBatch(juiceId, {
    liters,
    madeISO: iso(made),
    expiresISO: iso(expires),
    note
  })
}

export async function updateBatch(batchId, { remainingLiters, disposedAt, note }) {
  if (!Number.isFinite(batchId)) throw new Error('Invalid batch id')

  const batch = await getBatchById(batchId)
  if (!batch) throw new Error('Batch not found')

  const sets = []
  const args = []

  if (remainingLiters != null) {
    const rl = Number(remainingLiters)
    if (!Number.isFinite(rl) || rl < 0) throw new Error('remainingLiters must be a number >= 0')
    sets.push('remaining_liters = ?'); args.push(rl)

    if ((disposedAt === undefined || disposedAt === true) && rl === 0) {
      sets.push('disposed_at = ?'); args.push(iso(new Date()))
    }
  }

  if (disposedAt !== undefined) {
    if (disposedAt === true) {
      sets.push('disposed_at = ?'); args.push(iso(new Date()))
    } else if (disposedAt === null) {
      sets.push('disposed_at = NULL')
    } else {
      const d = new Date(disposedAt)
      if (Number.isNaN(d.getTime())) throw new Error('disposedAt must be true, null, or a valid date')
      sets.push('disposed_at = ?'); args.push(iso(d))
    }
  }

  if (note !== undefined) { sets.push('note = ?'); args.push(note) }

  if (sets.length === 0) throw new Error('No updatable fields')

  return updateBatchRow(batchId, sets, args)
}
