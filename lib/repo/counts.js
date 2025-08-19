import { getDb } from '../../utils/db.js'

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
