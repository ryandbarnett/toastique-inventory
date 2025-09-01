// auth/sessionHelpers.mjs
export function startSession(req, userId) {
  if (!req.session || typeof req.session !== 'object') req.session = {}
  req.session.userId = userId
}

export function clearSession(req) {
  req.session = null
}
