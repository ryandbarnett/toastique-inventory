export function getSessionUser(req) {
  return req?.session?.user ?? null
}

export function requireAuth(req, res, next) {
  if (!getSessionUser(req)) return res.status(401).json({ error: 'auth required' })
  next()
}
