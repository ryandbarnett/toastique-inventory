// lib/repo/sql/counts.sql.js
export const SQL = {
  getLatestCountsMap: `
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
  `,
  addDailyCount: `
    INSERT INTO juice_counts (juice_id, count_liters, counted_at, count_date, note)
    VALUES (?,?,?,?,?)
  `,
}
