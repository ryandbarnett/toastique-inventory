export function getSessionUserId(req) {
  return req?.session?.userId ?? null
}

export function requireAuth(req, res, next) {
  if (!getSessionUserId(req)) {
    return res.status(401).json({ error: 'auth required' })
  }
  next()
}
