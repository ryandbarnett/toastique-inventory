import { describe, it, expect } from 'vitest'
import { validateLiters } from '../../../lib/service/juices.js'

describe('validateLiters', () => {
  it('accepts numbers within [0, 30]', () => {
    expect(validateLiters(0).ok).toBe(true)
    expect(validateLiters(15).ok).toBe(true)
    expect(validateLiters(30).ok).toBe(true)
  })

  it('rejects invalid inputs', () => {
    for (const bad of [-1, 31, NaN, Infinity, '5', null, {}, []]) {
      const result = validateLiters(bad)
      expect(result.ok).toBe(false)
    }
  })
})
