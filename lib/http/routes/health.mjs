// lib/http/routes/health.mjs
import express from 'express'

export function makeHealthRouter() {
  const r = express.Router()
  r.get('/health', (_req, res) => {
    res.json({ ok: true })
  })
  return r
}
