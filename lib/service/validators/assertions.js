// lib/service/validators/assertions.js
export function assertValidId(id, what = 'id') {
  if (!Number.isFinite(id)) throw new Error(`Invalid ${what}`)
}

export function assertValidBatchSize(size) {
  if (!(size === 1 || size === 1.5)) throw new Error('size must be 1 or 1.5')
}

export function assertJuiceIdAndCount(juiceId, countLiters) {
  if (!Number.isFinite(juiceId) || !Number.isFinite(countLiters)) {
    throw new Error('id (param) and countLiters (body) must be numbers')
  }
}
