import express from 'express'
// ❌ remove direct bcrypt usage in this file
// import bcrypt from 'bcryptjs'
import { isValidPin, hashPin, verifyPin } from './crypto/pin.mjs'
import { sendError, requireBodyFields } from './http.mjs'

export function makeAuthRouter({ userRepo, session, paths = {}, security = {} }) {
  const r = express.Router()
  const P = {
    begin:  '/begin',
    setPin: '/set-pin',
    login:  '/login',
    logout: '/logout',
    me:     '/me',
    users:  '/users',
    ...paths,
  }

  // --- Lightweight in-memory rate limiter for login attempts ---
  // (good enough for a small staff app; upgrade to Redis later if needed)
  const attempts = new Map()
  const WINDOW_MS = Number(security.windowMs ?? (10 * 60 * 1000)) // default 10m
  const MAX_TRIES = Number(security.maxTries ?? 5)
  const LOCK_MS   = Number(security.lockMs ?? (10 * 60 * 1000))   // default 10m

  function keyFor(req) {
    // prefer explicit userId if present; otherwise fall back to IP
    const id = req.body?.userId
    return (id != null ? String(id) : req.ip) || req.ip
  }

  function getState(key) {
    const now = Date.now()
    const v = attempts.get(key) || { tries: 0, first: now, lockUntil: 0 }
    // reset window if expired and not locked
    if (now - v.first > WINDOW_MS && now > v.lockUntil) {
      return { tries: 0, first: now, lockUntil: 0 }
    }
    return v
  }

  function recordFail(key) {
    const now = Date.now()
    const v = getState(key)
    v.tries += 1
    if (v.tries >= MAX_TRIES) v.lockUntil = now + LOCK_MS
    attempts.set(key, v)
  }

  function clearAttempts(key) {
    attempts.delete(key)
  }

  function isLocked(key) {
    const now = Date.now()
    const v = getState(key)
    return now < v.lockUntil
  }

  // --- Helpers ---
  function parseUserIdOr400(res, raw) {
    const id = Number(raw)
    if (!Number.isInteger(id) || id <= 0) {
      sendError(res, 400, 'Invalid userId')
      return null
    }
    return id
  }

  // --- Routes ---
  r.post(P.begin, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId'])) return
    const id = parseUserIdOr400(res, req.body.userId); if (id == null) return
    const u = await userRepo.findById(id)
    if (!u) return sendError(res, 404, 'User not found')
    res.json({ name: u.name, needsPinSetup: u.pin_hash == null })
  })

  r.post(P.setPin, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin', 'confirm'])) return
    const id = parseUserIdOr400(res, req.body.userId); if (id == null) return
    const { pin, confirm } = req.body
    const pinNorm = String(pin).trim()
    const confirmNorm = String(confirm).trim()

    const u = await userRepo.findById(id)
    if (!u) return sendError(res, 404, 'User not found')
    if (u.pin_hash != null) return sendError(res, 409, 'PIN already set')
    if (!isValidPin(pinNorm)) return sendError(res, 400, 'PIN must be 4 digits')
    if (pinNorm !== confirmNorm) return sendError(res, 400, 'PIN mismatch')

    // ✅ Hash via helper (bcryptjs under the hood), async + proper cost
    const hash = await hashPin(pinNorm)
    await userRepo.setPinHash(id, hash)

    session.setUserId(req, id)
    res.json({ id: u.id, name: u.name })
  })

  r.post(P.login, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin'])) return

    const k = keyFor(req)
    if (isLocked(k)) {
      return sendError(res, 429, 'Too many attempts. Try again later.')
    }

    const id = parseUserIdOr400(res, req.body.userId); if (id == null) return
    const { pin } = req.body
    const pinNorm = String(pin).trim()

    const u = await userRepo.findById(id)
    if (!u) {
      recordFail(k)
      return sendError(res, 404, 'User not found')
    }
    if (u.pin_hash == null) {
      // account exists but PIN not set yet
      recordFail(k)
      return sendError(res, 409, 'PIN not set')
    }

    // ✅ Constant-time verify via helper
    const ok = await verifyPin(pinNorm, u.pin_hash)
    if (!ok) {
      recordFail(k)
      return sendError(res, 401, 'Invalid credentials')
    }

    clearAttempts(k)
    session.setUserId(req, id)
    res.json({ id: u.id, name: u.name })
  })

  r.post(P.logout, (req, res) => {
    session.clear(req)
    res.status(204).end()
  })

  r.get(P.me, async (req, res) => {
    const userId = session.getUserId(req)
    if (!userId) return res.json({ authenticated: false, user: null })
    const u = await userRepo.findById(userId)
    res.json({ authenticated: !!u, user: u ? { id: u.id, name: u.name } : null })
  })

  r.get(P.users, async (_req, res) => {
    const users = await userRepo.listUsers()
    res.json(users)
  })

  return r
}
