// lib/service/updateBatch.js
import { iso } from '../config.js'
import { updateBatchRow } from '../repo/index.js'
import { assertValidId } from './validators/assertions.js'
import { ensureBatchExists } from './validators/entities.js'
import { coerceRemainingLitersOrNull } from './validators/parse.js'
import { normalizeDisposedAt, normalizeLiters, normalizeNote } from './norm.js'

// ——— helpers (file‑private) ———
function nowISO() {
  return iso(new Date())
}

function computeDisposedAtParts({ disposedAtNorm, zeroRemainingImpliesDispose }) {
  const sets = []
  const args = []

  if (disposedAtNorm.kind === 'unset' && zeroRemainingImpliesDispose) {
    sets.push('disposed_at = ?'); args.push(nowISO())
    return { sets, args }
  }

  if (disposedAtNorm.kind === 'now') {
    sets.push('disposed_at = ?'); args.push(nowISO())
  } else if (disposedAtNorm.kind === 'null') {
    sets.push('disposed_at = NULL')
  } else if (disposedAtNorm.kind === 'date') {
    sets.push('disposed_at = ?'); args.push(iso(disposedAtNorm.date))
  }

  return { sets, args }
}

function buildUpdateParts({ remainingLiters, disposedAt, note }) {
  const sets = []
  const args = []

  // remaining_liters
  const rl = coerceRemainingLitersOrNull(remainingLiters)
  if (rl !== null) {
    sets.push('remaining_liters = ?')
    args.push(normalizeLiters(rl))
  }

  // disposed_at (depends on remainingLiters logic)
  const disposedAtNorm = normalizeDisposedAt(disposedAt)
  const { sets: dSets, args: dArgs } = computeDisposedAtParts({
    disposedAtNorm,
    zeroRemainingImpliesDispose: rl === 0 && (disposedAtNorm.kind === 'unset' || disposedAtNorm.kind === 'now')
  })
  sets.push(...dSets); args.push(...dArgs)

  // note
  if (note !== undefined) {
    sets.push('note = ?'); args.push(normalizeNote(note))
  }

  return { sets, args }
}

// ——— public API ———
export default async function updateBatch(batchId, { remainingLiters, disposedAt, note }) {
  assertValidId(batchId, 'batch id')
  await ensureBatchExists(batchId)

  const { sets, args } = buildUpdateParts({ remainingLiters, disposedAt, note })
  if (sets.length === 0) throw new Error('No updatable fields')

  return updateBatchRow(batchId, sets, args)
}
