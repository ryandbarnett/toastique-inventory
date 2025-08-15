// lib/repo.js
import { getDb } from '../utils/db.js'

export async function listJuicesOrdered() {
  const db = await getDb()
  return db.all(`
    SELECT id, name, par_liters AS parLiters, display_order AS displayOrder
    FROM juices
    ORDER BY display_order ASC
  `)
}

export async function getLatestCountsMap(today) {
  const db = await getDb()
  const latest = await db.all(`
    WITH latest AS (
      SELECT juice_id, MAX(counted_at) AS max_counted_at
      FROM juice_counts
      WHERE count_date = ?
      GROUP BY juice_id
    )
    SELECT c.juice_id AS juiceId, c.count_liters AS countLiters, c.counted_at AS countedAt
    FROM juice_counts c
    JOIN latest l
      ON l.juice_id = c.juice_id AND l.max_counted_at = c.counted_at
  `, [today])
  return new Map(latest.map(r => [r.juiceId, r]))
}

export async function listActiveBatches(juiceId, nowISO) {
  const db = await getDb()
  return db.all(`
    SELECT id,
           made_at          AS madeAt,
           expires_at       AS expiresAt,
           remaining_liters AS remainingLiters
    FROM juice_batches
    WHERE juice_id = ?
      AND disposed_at IS NULL
      AND remaining_liters > 0
      AND expires_at > ?
    ORDER BY made_at ASC
  `, [juiceId, nowISO])
}

export async function getJuiceById(id) {
  const db = await getDb()
  return db.get(`SELECT id, name, par_liters AS parLiters FROM juices WHERE id = ?`, [id])
}

export async function insertBatch(juiceId, { liters, madeISO, expiresISO, note }) {
  const db = await getDb()
  const result = await db.run(`
    INSERT INTO juice_batches
      (juice_id, made_at, expires_at, volume_liters, remaining_liters, disposed_at, note)
    VALUES (?,?,?,?,?,?,?)
  `, [juiceId, madeISO, expiresISO, liters, liters, null, note ?? null])
  return getBatchById(result.lastID)
}

export async function getBatchById(batchId) {
  const db = await getDb()
  return db.get(`
    SELECT id, juice_id AS juiceId, made_at AS madeAt, expires_at AS expiresAt,
           volume_liters AS volumeLiters, remaining_liters AS remainingLiters,
           disposed_at AS disposedAt, note
    FROM juice_batches
    WHERE id = ?
  `, [batchId])
}

export async function updateBatchRow(batchId, sets, args) {
  const db = await getDb()
  args.push(batchId)
  await db.run(`UPDATE juice_batches SET ${sets.join(', ')} WHERE id = ?`, args)
  return getBatchById(batchId)
}

export async function addDailyCount(juiceId, countLiters, note) {
  const db = await getDb()
  const now = new Date()
  const counted_at = now.toISOString()
  const count_date = counted_at.slice(0, 10)
  await db.run(
    `INSERT INTO juice_counts (juice_id, count_liters, counted_at, count_date, note)
     VALUES (?,?,?,?,?)`,
    [juiceId, countLiters, counted_at, count_date, note ?? null]
  )
  return { countedAt: counted_at, countDate: count_date }
}
