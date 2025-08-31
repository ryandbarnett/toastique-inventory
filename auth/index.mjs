import { makeAuthRouter } from './routes.mjs'
import { requireAuth } from './middleware.mjs'
import { cookieSessionMw } from './session.mjs'

/**
 * Mounts session middleware and /api/auth routes.
 * Keep this the ONLY integration point with the app.
 */
export function mountAuth(app, db, { session } = {}) {
  app.use(cookieSessionMw(session))
  app.use('/api/auth', makeAuthRouter(db))
}

export { requireAuth }
