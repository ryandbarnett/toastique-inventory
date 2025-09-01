import { describe, it, expect } from 'vitest'
import { sendError } from '../errorHelpers.mjs'

function makeRes() {
  return {
    _status: null,
    _payload: null,
    status(code) { this._status = code; return this },
    json(body)   { this._payload = body; return this },
  }
}

describe('sendError', () => {
  it('sets status and error payload, returns res for early-return style', () => {
    const res = makeRes()
    const ret = sendError(res, 401, 'Invalid credentials')
    expect(ret).toBe(res)
    expect(res._status).toBe(401)
    expect(res._payload).toEqual({ error: 'Invalid credentials' })
  })

  it('works for multiple status/message pairs', () => {
    const cases = [
      [400, 'Bad request'],
      [404, 'User not found'],
      [409, 'PIN already set'],
    ]
    for (const [code, msg] of cases) {
      const res = makeRes()
      sendError(res, code, msg)
      expect(res._status).toBe(code)
      expect(res._payload).toEqual({ error: msg })
    }
  })
})
