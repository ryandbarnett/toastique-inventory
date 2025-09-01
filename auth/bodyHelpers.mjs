// auth/bodyHelpers.mjs
// Mirror the exact behavior you had inline in routes.mjs

import { sendError } from './errorHelpers.mjs'

export function requireBodyFields(res, body, fields) {
  for (const f of fields) {
    if (body?.[f] == null) {
      sendError(res, 400, `missing field: ${f}`)
      return false
    }
  }
  return true
}
