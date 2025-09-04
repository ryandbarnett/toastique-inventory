import { makeAuthRouter } from './router.mjs'
import { makeRequireAuth } from './middleware.mjs'

/** Public API */
export function mountAuth(app, { userRepo, session, paths } = {}) {
  if (!session?.mw) throw new Error('session.mw is required')
  app.use(session.mw)
  app.use('/api/auth', makeAuthRouter({ userRepo, session, paths }))
}

export function requireAuth(session) {
  return makeRequireAuth(session)
}
