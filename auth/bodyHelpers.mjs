// auth/bodyHelpers.mjs
// Mirror the exact behavior you had inline in routes.mjs
export function requireBodyFields(res, body, fields) {
  for (const f of fields) {
    if (body?.[f] == null) {
      res.status(400).json({ error: `missing field: ${f}` })
      return false
    }
  }
  return true
}
