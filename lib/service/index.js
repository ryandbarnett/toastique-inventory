// lib/service/index.js
import { makeEntityValidators } from './validators/entities.js'
import { makeCreateBatch } from './createBatch.js'
import { makeAddJuiceCount } from './addJuiceCount.js'
import { makeUpdateBatch } from './updateBatch.js'
import { makeListJuicesWithStatus } from './listJuicesWithStatus.js'

/**
 * @param {{ juices:any, batches:any, counts:any }} repo
 */
export function makeService(repo) {
  const validators = makeEntityValidators(repo)
  return {
    createBatch:          makeCreateBatch(repo, validators),
    addJuiceCount:        makeAddJuiceCount(repo, validators),
    updateBatch:          makeUpdateBatch(repo, validators),
    listJuicesWithStatus: makeListJuicesWithStatus(repo),
  }
}

// ⛔️ No default exports or back-compat singletons here.
