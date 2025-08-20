// lib/service/validators/entities.js
/**
 * Provide entity validators bound to a specific repo.
 * @param {{ juices:{getJuiceById(id:number):Promise<any>}, batches:{getBatchById(id:number):Promise<any>} }} repo
 */
export function makeEntityValidators(repo) {
  async function ensureJuiceExists(juiceId) {
    const juice = await repo.juices.getJuiceById(juiceId)
    if (!juice) throw new Error('Juice not found')
    return juice
  }

  async function ensureBatchExists(batchId) {
    const batch = await repo.batches.getBatchById(batchId)
    if (!batch) throw new Error('Batch not found')
    return batch
  }

  return { ensureJuiceExists, ensureBatchExists }
}
