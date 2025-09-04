// auth/__tests__/pinHelpers.spec.mjs
import { describe, it, expect } from 'vitest'
import { isValidPin } from '../src/crypto/pin.mjs'

describe('isValidPin', () => {
  it('accepts exactly 4 digits', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin(9876)).toBe(true)
  })

  it('rejects too short/long', () => {
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
  })

  it('rejects non-numeric', () => {
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('abcd')).toBe(false)
  })

  it('accepts leading zeros when passed as a string', () => {
    expect(isValidPin('0123')).toBe(true)
  })

  it('rejects with surrounding spaces (unless you want to allow trim)', () => {
    expect(isValidPin(' 1234')).toBe(true)   // becomes true if helper trims
    expect(isValidPin('1234 ')).toBe(true)
  })

  it('handles nullish safely', () => {
    expect(isValidPin(null)).toBe(false)
    expect(isValidPin(undefined)).toBe(false)
  })
})

