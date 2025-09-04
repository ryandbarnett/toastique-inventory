export function makeRequireAuth(session) {
  return function requireAuth(req, res, next) {
    if (!session.getUserId(req)) return res.status(401).json({ error: 'auth required' })
    next()
  }
}
