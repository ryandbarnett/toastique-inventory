// lib/service/validators/entities.js
import { getBatchById, getJuiceById } from '../../repo/index.js'

export async function ensureBatchExists(batchId) {
  const batch = await getBatchById(batchId)
  if (!batch) throw new Error('Batch not found')
  return batch
}

export async function ensureJuiceExists(juiceId) {
  const juice = await getJuiceById(juiceId)
  if (!juice) throw new Error('Juice not found')
  return juice
}
