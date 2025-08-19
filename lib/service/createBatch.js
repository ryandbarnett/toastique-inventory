// lib/service/createBatch.js
import { QT_TO_L, YIELD_QT, iso } from '../config.js'
import { insertBatch } from '../repo/index.js'
import { assertValidId, assertValidBatchSize } from './validators/assertions.js'
import { ensureJuiceExists } from './validators/entities.js'
import { parseMadeDateOrNow } from './validators/parse.js'
import { normalizeLiters, normalizeNote } from './norm.js'

// ——— helpers (file‑private) ———
function computeLiters(juice, { size, volumeLiters }) {
  const asNum = Number(volumeLiters)
  if (Number.isFinite(asNum) && asNum > 0) {
    return normalizeLiters(asNum)
  }

  assertValidBatchSize(size)

  const baseQt = YIELD_QT[juice.name]
  const computed = baseQt * size * QT_TO_L
  return normalizeLiters(computed)
}

function computeExpires(made, days = 5) {
  return new Date(made.getTime() + days * 24 * 60 * 60 * 1000)
}

// ——— public API ———
export default async function createBatch(juiceId, { size, volumeLiters, madeAt, note }) {
  assertValidId(juiceId, 'juice id')
  const juice = await ensureJuiceExists(juiceId)

  const liters = computeLiters(juice, { size, volumeLiters })
  const made = parseMadeDateOrNow(madeAt)
  const expires = computeExpires(made, 5)

  return insertBatch(juiceId, {
    liters,
    madeISO: iso(made),
    expiresISO: iso(expires),
    note: normalizeNote(note),
  })
}
