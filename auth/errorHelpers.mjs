// auth/errorHelpers.mjs
export function sendError(res, status, message) {
  return res.status(status).json({ error: message })
}
