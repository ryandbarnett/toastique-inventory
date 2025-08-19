import { getDb } from '../../utils/db.js'

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
