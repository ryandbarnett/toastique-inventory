// File: tests/normalize.test.js

import { describe, it, expect } from 'vitest'
import { normalizeItemInput } from '../utils/normalize.js'

describe('normalizeItemInput', () => {
  it('trims name/unit and coerces numeric strings', () => {
    const r = normalizeItemInput({ name: '  Flour  ', quantity: ' 5 ', unit: ' lbs ' })
    expect(r.ok).toBe(true)
    expect(r.value).toEqual({ name: 'Flour', quantity: 5, unit: 'lbs' })
  })

  it('treats empty quantity as 0', () => {
    const r = normalizeItemInput({ name: 'Sugar', quantity: '', unit: 'lbs' })
    expect(r.ok).toBe(true)
    expect(r.value.quantity).toBe(0)
  })

  it('rejects NaN quantity', () => {
    const r = normalizeItemInput({ name: 'Milk', quantity: 'abc', unit: 'qt' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/number/i)
  })

  it('rejects blank name/unit', () => {
    expect(normalizeItemInput({ name: '   ', quantity: 1, unit: 'qt' }).ok).toBe(false)
    expect(normalizeItemInput({ name: 'Milk', quantity: 1, unit: '   ' }).ok).toBe(false)
  })

  it('treats undefined/null quantity as 0', () => {
    expect(normalizeItemInput({ name: 'Rice', unit: 'lbs' }).value.quantity).toBe(0)
    expect(normalizeItemInput({ name: 'Rice', unit: 'lbs', quantity: null }).value.quantity).toBe(0)
  })

  it('accepts "0" and 0', () => {
    expect(normalizeItemInput({ name: 'Salt', unit: 'lbs', quantity: '0' }).value.quantity).toBe(0)
    expect(normalizeItemInput({ name: 'Salt', unit: 'lbs', quantity: 0 }).value.quantity).toBe(0)
  })
})
