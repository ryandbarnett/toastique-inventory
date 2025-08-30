import cookieSession from 'cookie-session'

export function cookieSessionMw(overrides = {}) {
  const {
    name = 'sess',
    keys = [process.env.SESSION_SECRET || 'dev-secret'],
    maxAge = 30 * 24 * 60 * 60 * 1000,
    sameSite = 'lax',
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
  } = overrides

  return cookieSession({ name, keys, maxAge, sameSite, httpOnly, secure })
}
