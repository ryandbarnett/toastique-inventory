import cookieSession from 'cookie-session'

export function cookieSessionMw(overrides = {}) {
  // Allow rotation via env:
  // SESSION_SECRETS="k1,k2,k3"  (preferred)
  // or legacy: SESSION_SECRET="single-key"
  const envSecrets =
    (process.env.SESSION_SECRETS &&
      process.env.SESSION_SECRETS.split(',').map(s => s.trim()).filter(Boolean)) ||
    (process.env.SESSION_SECRET ? [process.env.SESSION_SECRET] : null)

  const isProd = process.env.NODE_ENV === 'production'

  const {
    name = 'toastique.sid',
    // if overrides.keys is provided, it will be used; otherwise we fall back to envSecrets or a dev key
    keys,
    // shorter lifetime reduces exposure window (12h)
    maxAge = 12 * 60 * 60 * 1000,
    sameSite = 'lax',
    httpOnly = true,
    secure = isProd,
    path = '/',
  } = overrides

  const finalKeys = keys || envSecrets || ['dev-secret']

  return cookieSession({
    name,
    keys: finalKeys,
    maxAge,
    sameSite,
    httpOnly,
    secure,
    path,
  })
}
