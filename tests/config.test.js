// tests/config.test.js
import { describe, it, expect } from 'vitest'
import { parseMultiplier } from '../lib/config.js'

describe('parseMultiplier', () => {
  it('parses common strings and numbers', () => {
    expect(parseMultiplier('1x')).toBe(1)
    expect(parseMultiplier('1.5x')).toBe(1.5)
    expect(parseMultiplier('2')).toBe(2)
    expect(parseMultiplier(2)).toBe(2)
  })

  it('trims and lowercases', () => {
    expect(parseMultiplier('  1.5X ')).toBe(1.5)
  })

  it('returns null on junk', () => {
    expect(parseMultiplier('big')).toBeNull()
    expect(parseMultiplier({})).toBeNull()
  })
})
