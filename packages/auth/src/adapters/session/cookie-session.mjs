import cookieSession from 'cookie-session'

export function makeCookieSession(overrides = {}) {
  const envSecrets =
    (process.env.SESSION_SECRETS &&
      process.env.SESSION_SECRETS.split(',').map(s => s.trim()).filter(Boolean)) ||
    (process.env.SESSION_SECRET ? [process.env.SESSION_SECRET] : null)

  const isProd = process.env.NODE_ENV === 'production'
  const {
    name = 'toastique.sid',
    keys = envSecrets,
    maxAge = 7 * 24 * 60 * 60 * 1000,
    sameSite = 'lax',
    httpOnly = true,
    secure = isProd,
    path = '/',
  } = overrides

  const finalKeys = keys ?? ['dev-secret']
  if (isProd && (!Array.isArray(finalKeys) || finalKeys.length === 0)) {
    throw new Error('SESSION_SECRET(S) must be set in production')
  }

  const mw = cookieSession({ name, keys: finalKeys, maxAge, sameSite, httpOnly, secure, path })
  return {
    mw,
    getUserId(req) { return req.session?.userId ?? null },
    setUserId(req, id) { if (!req.session) req.session = {}; req.session.userId = id },
    clear(req) { req.session = null },
  }
}
