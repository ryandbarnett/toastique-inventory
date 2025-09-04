// lib/http/errors.mjs

/**
 * Send a 404 JSON error with a default or custom message.
 */
export function notFound(res, msg = 'Not Found') {
  return res.status(404).json({ error: msg })
}

/**
 * Build a generic error-handling middleware.
 * Logs full stack in dev, just message in prod.
 */
export function makeErrorHandler({ log = console.error } = {}) {
  return (err, _req, res, _next) => {
    if (process.env.NODE_ENV === 'production') {
      log(err.message)
    } else {
      log(err)
    }
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
