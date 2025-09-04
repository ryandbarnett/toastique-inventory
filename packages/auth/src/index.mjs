import { makeAuthRouter } from './router.mjs'
import { makeRequireAuth } from './middleware.mjs'
import { makeCookieSession } from './adapters/session/cookie-session.mjs'

/** Public API */
export function mountAuth(app, { userRepo, session, paths } = {}) {
  if (!session?.mw) throw new Error('session.mw is required')
  app.use(session.mw)
  app.use('/api/auth', makeAuthRouter({ userRepo, session, paths }))
}

export function requireAuth(session) {
  return makeRequireAuth(session)
}

/**
  * Install auth in one call:
  * - builds cookie session (reads from env via makeCookieSession defaults)
  * - mounts /api/auth
  * - returns { requireAuth } for protecting routes
  */
export function installAuth(app, { userRepo, env = process.env, paths } = {}) {
  // If you want env-driven overrides, you can pick them up here.
  // makeCookieSession already reads NODE_ENV and SESSION_SECRET(S) internally.
  const session = makeCookieSession({
    name: env.SESSION_NAME || 'toastique.sid',
    // You could also pass maxAge, sameSite, etc. via env if desired.
  })
  mountAuth(app, { userRepo, session, paths })
  return {
    requireAuth: makeRequireAuth(session),
    session, // exposed in case the host app needs it
  }
}