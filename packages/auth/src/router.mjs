import express from 'express'
import bcrypt from 'bcryptjs'
import { isValidPin } from './crypto/pin.mjs'
import { sendError, requireBodyFields } from './http.mjs'

export function makeAuthRouter({ userRepo, session, paths = {} }) {
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

  r.post(P.begin, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId'])) return
    const id = Number(req.body.userId)
    const u = await userRepo.findById(id)
    if (!u) return sendError(res, 404, 'User not found')
    res.json({ name: u.name, needsPinSetup: u.pin_hash == null })
  })

  r.post(P.setPin, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin', 'confirm'])) return
    const id = Number(req.body.userId)
    const { pin, confirm } = req.body
    const pinNorm = String(pin).trim()
    const confirmNorm = String(confirm).trim()
    const u = await userRepo.findById(id)
    if (!u) return sendError(res, 404, 'User not found')
    if (u.pin_hash != null) return sendError(res, 409, 'PIN already set')
    if (!isValidPin(pinNorm)) return sendError(res, 400, 'PIN must be 4 digits')
    if (pinNorm !== confirmNorm) return sendError(res, 400, 'PIN mismatch')
    const hash = bcrypt.hashSync(pinNorm, 10)
    await userRepo.setPinHash(id, hash)
    session.setUserId(req, id)
    res.json({ id: u.id, name: u.name })
  })

  r.post(P.login, async (req, res) => {
    if (!requireBodyFields(res, req.body, ['userId', 'pin'])) return
    const id = Number(req.body.userId)
    const { pin } = req.body
    const pinNorm = String(pin).trim()
    const u = await userRepo.findById(id)
    if (!u) return sendError(res, 404, 'User not found')
    if (u.pin_hash == null) return sendError(res, 409, 'PIN not set')
    const ok = bcrypt.compareSync(pinNorm, u.pin_hash)
    if (!ok) return sendError(res, 401, 'Invalid credentials')
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
