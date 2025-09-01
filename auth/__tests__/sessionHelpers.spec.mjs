import { describe, it, expect } from 'vitest'
import { startSession, clearSession } from '../sessionHelpers.mjs'

describe('session helpers', () => {
  it('startSession creates req.session if missing and sets userId', () => {
    const req = {}
    startSession(req, 42)
    expect(req.session).toEqual({ userId: 42 })
  })

  it('startSession preserves existing session fields', () => {
    const req = { session: { foo: 'bar' } }
    startSession(req, 7)
    expect(req.session).toEqual({ foo: 'bar', userId: 7 })
  })

  it('clearSession sets session to null', () => {
    const req = { session: { userId: 1 } }
    clearSession(req)
    expect(req.session).toBeNull()
  })
})
