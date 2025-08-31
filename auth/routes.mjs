// auth/routes.mjs
import express from 'express'
import bcrypt from 'bcryptjs'

export function makeAuthRouter(db) {
  const router = express.Router()

  // Helpers
  const getUserById = db.prepare(`SELECT id, name, pin_hash FROM users WHERE id = ?`)
  const setPin = db.prepare(`UPDATE users SET pin_hash = ? WHERE id = ?`)
  const userExists = (id) => !!getUserById.get(id)

  function requireBodyFields(res, body, fields) {
    for (const f of fields) {
      if (body?.[f] == null) {
        res.status(400).json({ error: `missing field: ${f}` })
        return false
      }
    }
    return true
  }

  // POST /api/auth/begin  { userId } -> { name, needsPinSetup }
  router.post('/begin', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId'])) return
    const id = Number(req.body.userId)
    const user = getUserById.get(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ name: user.name, needsPinSetup: user.pin_hash == null })
  })

  // POST /api/auth/set-pin  { userId, pin, confirm } -> { id, name }
  router.post('/set-pin', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin', 'confirm'])) return
    const id = Number(req.body.userId)
    const { pin, confirm } = req.body
    const user = getUserById.get(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // already set?
    if (user.pin_hash != null) return res.status(409).json({ error: 'PIN already set' })
    // 4-digit check
    if (!/^\d{4}$/.test(String(pin))) return res.status(400).json({ error: 'PIN must be 4 digits' })
    if (pin !== confirm) return res.status(400).json({ error: 'PIN mismatch' })

    const hash = bcrypt.hashSync(String(pin), 10)
    setPin.run(hash, id)

    // start session
    req.session.userId = user.id
    res.json({ id: user.id, name: user.name })
  })

  // POST /api/auth/login  { userId, pin } -> { id, name }
  router.post('/login', (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin'])) return
    const id = Number(req.body.userId)
    const { pin } = req.body
    const user = getUserById.get(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.pin_hash == null) return res.status(409).json({ error: 'PIN not set yet' })

    const ok = bcrypt.compareSync(String(pin), user.pin_hash)
    if (!ok) return res.status(403).json({ error: 'Invalid PIN' })

    req.session.userId = user.id
    res.json({ id: user.id, name: user.name })
  })

  // POST /api/auth/logout -> 204
  router.post('/logout', (req, res) => {
    req.session = null
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
