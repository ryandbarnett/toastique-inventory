export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'auth required' })
  }
  next()
}
// DEPRECATED: runtime moved to packages/auth. Keep this file until we migrate tests.
