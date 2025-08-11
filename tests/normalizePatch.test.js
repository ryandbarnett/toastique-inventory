// tests/normalizePatch.test.js
import { describe, it, expect } from 'vitest'
import { normalizePatchInput } from '../utils/normalize.js'

describe('normalizePatchInput (partial updates)', () => {
  it('accepts only par and coerces numeric strings (decimal allowed)', () => {
    const r = normalizePatchInput({ par: ' 3.5 ' })
    expect(r.ok).toBe(true)
    expect(r.value).toEqual({ par: 3.5 })
  })

  it('rejects negative par and empty-par', () => {
    expect(normalizePatchInput({ par: -1 }).ok).toBe(false)
    expect(normalizePatchInput({ par: '' }).ok).toBe(false)
  })

  it('trims name/unit if provided and rejects blanks', () => {
    const good = normalizePatchInput({ name: '  Flour  ', unit: '  lbs ' })
    expect(good.ok).toBe(true)
    expect(good.value).toEqual({ name: 'Flour', unit: 'lbs' })

    expect(normalizePatchInput({ name: '   ' }).ok).toBe(false)
    expect(normalizePatchInput({ unit: '   ' }).ok).toBe(false)
  })

  it('treats quantity "" as 0; rejects NaN strings', () => {
    expect(normalizePatchInput({ quantity: '' }).value.quantity).toBe(0)
    expect(normalizePatchInput({ quantity: 'abc' }).ok).toBe(false)
  })

  it('rejects when no updatable fields provided', () => {
    const r = normalizePatchInput({})
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/no updatable fields/i)
  })
})
