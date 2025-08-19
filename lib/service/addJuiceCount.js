// lib/service/addJuiceCount.js
import { addDailyCount } from '../repo/index.js'
import { assertJuiceIdAndCount } from './validators/assertions.js'
import { ensureJuiceExists } from './validators/entities.js'
import { normalizeLiters, normalizeNote } from './norm.js'

/** Record a daily count for a juice id, returning { countedAt, countDate }. */
export default async function addJuiceCount(juiceId, countLiters, note) {
  assertJuiceIdAndCount(juiceId, countLiters)
  await ensureJuiceExists(juiceId)

  const liters = normalizeLiters(countLiters)   // stable precision (e.g., 3 dp)
  const cleanedNote = normalizeNote(note)       // avoid storing empty strings

  return addDailyCount(juiceId, liters, cleanedNote)
}

