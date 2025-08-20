// lib/service/addJuiceCount.js
import { assertValidId } from './validators/assertions.js'

/**
 * @param {{ counts:{addDailyCount:Function} }} repo
 * @param {{ ensureJuiceExists:(id:number)=>Promise<any> }} validators
 */
export function makeAddJuiceCount(repo, { ensureJuiceExists }) {
  return async function addJuiceCount(juiceId, countLiters, note) {
    assertValidId(juiceId, 'juice id')
    await ensureJuiceExists(juiceId)
    return repo.counts.addDailyCount(juiceId, Number(countLiters), note ?? null)
  }
}
