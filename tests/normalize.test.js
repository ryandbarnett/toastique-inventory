// tests/normalize.test.js

import { describe, it, expect } from 'vitest'
import { normalizeItemInput } from '../utils/normalize.js'

describe('normalizeItemInput', () => {
  it('trims name/unit and coerces numeric strings', () => {
    const r = normalizeItemInput({ name: '  Flour  ', quantity: ' 5 ', unit: ' lbs ', par: ' 3 ' })
    expect(r.ok).toBe(true)
    expect(r.value).toEqual({ name: 'Flour', quantity: 5, unit: 'lbs', par: 3 })
  })

  it('treats empty quantity as 0', () => {
    const r = normalizeItemInput({ name: 'Sugar', quantity: '', unit: 'lbs', par: 10 })
    expect(r.ok).toBe(true)
    expect(r.value.quantity).toBe(0)
    expect(r.value.par).toBe(10)
  })

  it('rejects NaN quantity', () => {
    const r = normalizeItemInput({ name: 'Milk', quantity: 'abc', unit: 'qt', par: 1 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/number/i)
  })

  it('rejects blank name/unit', () => {
    expect(normalizeItemInput({ name: '   ', quantity: 1, unit: 'qt', par: 0 }).ok).toBe(false)
    expect(normalizeItemInput({ name: 'Milk', quantity: 1, unit: '   ', par: 0 }).ok).toBe(false)
  })

  it('treats undefined/null quantity as 0', () => {
    expect(normalizeItemInput({ name: 'Rice', unit: 'lbs', par: 2 }).value.quantity).toBe(0)
    expect(normalizeItemInput({ name: 'Rice', unit: 'lbs', quantity: null, par: 2 }).value.quantity).toBe(0)
  })

  it('accepts "0" and 0 as quantity', () => {
    expect(normalizeItemInput({ name: 'Salt', unit: 'lbs', quantity: '0', par: 5 }).value.quantity).toBe(0)
    expect(normalizeItemInput({ name: 'Salt', unit: 'lbs', quantity: 0, par: 5 }).value.quantity).toBe(0)
  })

  it('rejects missing par', () => {
    const r = normalizeItemInput({ name: 'Oil', unit: 'gal', quantity: 1 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/par is required/i)
  })

  it('rejects NaN par', () => {
    const r = normalizeItemInput({ name: 'Oil', unit: 'gal', quantity: 1, par: 'abc' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/par must be a number/i)
  })

  it('rejects negative par', () => {
    const r = normalizeItemInput({ name: 'Vinegar', unit: 'qt', quantity: 1, par: -1 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/≥\s*0/)
  })
})
