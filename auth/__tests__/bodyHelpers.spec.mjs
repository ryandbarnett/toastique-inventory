import { describe, it, expect } from 'vitest'
import { requireBodyFields } from '../bodyHelpers.mjs'

function makeRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.payload = body; return this },
  }
}

describe('requireBodyFields', () => {
  it('returns true when all required fields are present (even if falsy)', () => {
    const res = makeRes()
    const ok = requireBodyFields(res, { userId: 0, pin: '', confirm: '0000' }, ['userId', 'pin'])
    expect(ok).toBe(true)
    expect(res.statusCode).toBe(null)
    expect(res.payload).toBe(null)
  })

  it('returns false and sends 400 when a field is missing', () => {
    const res = makeRes()
    const ok = requireBodyFields(res, { pin: '1234' }, ['userId', 'pin'])
    expect(ok).toBe(false)
    expect(res.statusCode).toBe(400)
    expect(res.payload).toEqual({ error: 'missing field: userId' })
  })

  it('returns false and sends 400 when a field is null/undefined', () => {
    const res = makeRes()
    const ok = requireBodyFields(res, { userId: null, pin: '1234' }, ['userId', 'pin'])
    expect(ok).toBe(false)
    expect(res.statusCode).toBe(400)
    expect(res.payload).toEqual({ error: 'missing field: userId' })
  })
})
