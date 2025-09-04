// auth/routes.mjs
import express from 'express'
import bcrypt from 'bcryptjs'
import { isValidPin } from './pinHelpers.mjs'
import { sendError, requireBodyFields, startSession, clearSession } from './helpers.mjs'

export function makeAuthRouter(db) {
  const router = express.Router()

  // Helpers
  const getUserById = db.prepare(`SELECT id, name, pin_hash FROM users WHERE id = ?`)
  const setPin = db.prepare(`UPDATE users SET pin_hash = ? WHERE id = ?`)

  // POST /api/auth/begin  { userId } -> { name, needsPinSetup }
  router.post('/begin', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId'])) return
    const id = Number(req.body.userId)
    const user = getUserById.get(id)
    if (!user) return sendError(res, 404, 'User not found')
    res.json({ name: user.name, needsPinSetup: user.pin_hash == null })
  })

  // POST /api/auth/set-pin  { userId, pin, confirm } -> { id, name }
  router.post('/set-pin', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin', 'confirm'])) return
    const id = Number(req.body.userId)
    const { pin, confirm } = req.body
    const pinNorm = String(pin).trim()
    const confirmNorm = String(confirm).trim()
    const user = getUserById.get(id)
    if (!user) return sendError(res, 404, 'User not found')

    // already set?
    if (user.pin_hash != null) return sendError(res, 409, 'PIN already set')
    // 4-digit check
    if (!isValidPin(pinNorm)) return sendError(res, 400, 'PIN must be 4 digits')
    if (pinNorm !== confirmNorm) return sendError(res, 400, 'PIN mismatch')

    const hash = bcrypt.hashSync(pinNorm, 10)
    setPin.run(hash, id)

    // start session
    startSession(req, user.id)
    res.json({ id: user.id, name: user.name })
  })

  // POST /api/auth/login  { userId, pin } -> { id, name }
  router.post('/login', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin'])) return
    const id = Number(req.body.userId)
    const { pin } = req.body
    const pinNorm = String(pin).trim()
    const user = getUserById.get(id)
    if (!user) return sendError(res, 404, 'User not found')
    if (user.pin_hash == null) return sendError(res, 409, 'PIN not set yet')

    const ok = bcrypt.compareSync(pinNorm, user.pin_hash)
    // Wrong PIN -> 401 Unauthorized (generic to avoid info leakage)
    // Reserve 403 Forbidden for "authenticated but not allowed" cases.
    if (!ok) return sendError(res, 401, 'Invalid credentials')

    startSession(req, user.id)
    res.json({ id: user.id, name: user.name })
  })

  // POST /api/auth/logout -> 204
  router.post('/logout', (req, res) => {
    clearSession(req)
    res.status(204).end()
  })

  // GET /api/auth/me -> always 200; { authenticated, user }
  router.get('/me', (req, res) => {
    if (!req.session?.userId) {
      return res.json({ authenticated: false, user: null });
    }
    const user = getUserById.get(req.session.userId);
    res.json({
      authenticated: true,
      user: { id: user.id, name: user.name }
    });
  });

  // GET /api/auth/users -> [{ id, name }]
  router.get('/users', (_req, res) => {
    const rows = db.prepare(`SELECT id, name FROM users ORDER BY name ASC`).all()
    res.json(rows)
  })

  return router
}
// DEPRECATED: runtime moved to packages/auth. Keep this file until we migrate tests.
