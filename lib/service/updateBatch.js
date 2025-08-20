// lib/service/updateBatch.js
import { iso } from '../config.js'
import { assertValidId } from './validators/assertions.js'
import { coerceRemainingLitersOrNull } from './validators/parse.js'
import { normalizeDisposedAt, normalizeLiters, normalizeNote } from './norm.js'

const nowISO = () => iso(new Date())

function computeDisposedAtPatch({ disposedAtNorm, zeroRemainingImpliesDispose }) {
  if (disposedAtNorm.kind === 'unset') {
    return zeroRemainingImpliesDispose ? { disposedAt: nowISO() } : { disposedAt: undefined }
  }
  if (disposedAtNorm.kind === 'now')  return { disposedAt: nowISO() }
  if (disposedAtNorm.kind === 'null') return { disposedAt: null }
  if (disposedAtNorm.kind === 'date') return { disposedAt: iso(disposedAtNorm.date) }
  return { disposedAt: undefined }
}

function buildPatch({ remainingLiters, disposedAt, note }) {
  const patch = {}
  const rl = coerceRemainingLitersOrNull(remainingLiters)
  if (rl !== null) patch.remainingLiters = normalizeLiters(rl)
  const disposedAtNorm = normalizeDisposedAt(disposedAt)
  const { disposedAt: dVal } = computeDisposedAtPatch({
    disposedAtNorm,
    zeroRemainingImpliesDispose: rl === 0 && (disposedAtNorm.kind === 'unset' || disposedAtNorm.kind === 'now'),
  })
  if (dVal !== undefined) patch.disposedAt = dVal
  if (note !== undefined) patch.note = normalizeNote(note)
  return patch
}

/**
 * @param {{ batches:{updateBatch:Function, getBatchById:Function} }} repo
 * @param {{ ensureBatchExists:(id:number)=>Promise<any> }} validators
 */
export function makeUpdateBatch(repo, { ensureBatchExists }) {
  return async function updateBatch(batchId, { remainingLiters, disposedAt, note }) {
    assertValidId(batchId, 'batch id')
    await ensureBatchExists(batchId)
    const patch = buildPatch({ remainingLiters, disposedAt, note })
    if (Object.keys(patch).length === 0) throw new Error('No updatable fields')
    return repo.batches.updateBatch(batchId, patch)
  }
}
