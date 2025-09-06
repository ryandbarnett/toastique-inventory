// packages/auth/src/index.mjs
import { makeAuthRouter } from './router.mjs'
import { makeRequireAuth } from './middleware.mjs'
import { makeCookieSession } from './adapters/session/cookie-session.mjs'

/** Public API */
export function mountAuth(app, { userRepo, session, paths, security } = {}) {
  if (!session?.mw) throw new Error('session.mw is required')
  app.use(session.mw)
  app.use('/api/auth', makeAuthRouter({ userRepo, session, paths, security }))
}

export function requireAuth(session) {
  return makeRequireAuth(session)
}

// Simple role gate wired to the same session/userRepo
export function makeRequireRole({ session, userRepo, role }) {
  return async function requireRole(req, res, next) {
    const userId = session.getUserId(req)
    if (!userId) return res.status(401).json({ error: 'auth required' })
    const u = await userRepo.findById(userId)
    if (!u || u.role !== role) return res.status(403).json({ error: 'Forbidden' })
    req.user = u
    next()
  }
}

/**
  * Install auth in one call:
  * - builds cookie session (reads from env via makeCookieSession defaults)
  * - mounts /api/auth
  * - returns { requireAuth } for protecting routes
  */
export function installAuth(app, { userRepo, env = process.env, paths, security } = {}) {
  // If you want env-driven overrides, you can pick them up here.
  // makeCookieSession already reads NODE_ENV and SESSION_SECRET(S) internally.
  const session = makeCookieSession({
    name: env.SESSION_NAME || 'toastique.sid',
    // You could also pass maxAge, sameSite, etc. via env if desired.
  })
  mountAuth(app, { userRepo, session, paths, security })
  return {
    requireAuth: makeRequireAuth(session),
    requireRoleAdmin: makeRequireRole({ session, userRepo, role: 'admin' }),
    session, // exposed in case the host app needs it
  }
}