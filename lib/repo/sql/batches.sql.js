// lib/repo/sql/batches.sql.js
export const SQL = {
  listActiveBatches: `
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
  `,
  insertBatch: `
    INSERT INTO juice_batches
      (juice_id, made_at, expires_at, volume_liters, remaining_liters, disposed_at, note)
    VALUES (?,?,?,?,?,?,?)
  `,
  getBatchById: `
    SELECT id, juice_id AS juiceId, made_at AS madeAt, expires_at AS expiresAt,
           volume_liters AS volumeLiters, remaining_liters AS remainingLiters,
           disposed_at AS disposedAt, note
    FROM juice_batches
    WHERE id = ?
  `
}
