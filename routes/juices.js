// routes/juices.js
import express from 'express'
import { listJuicesWithStatus, addJuiceCount, createBatch } from '../lib/service.js'
const router = express.Router()

router.get('/juices', async (_req, res) => {
  try { res.json(await listJuicesWithStatus()) }
  catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/juices/:id/counts', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { countLiters, note } = req.body || {}
    const { countedAt, countDate } = await addJuiceCount(id, Number(countLiters), note)
    res.status(201).json({ ok: true, countedAt, countDate })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const code = /not found|invalid|must be/i.test(msg) ? 400 : 500
    res.status(code).json({ error: msg })
  }
})

router.post('/juices/:id/batches', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const batch = await createBatch(id, req.body || {})
    res.status(201).json({ ok: true, batch })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const code = /not found|invalid|required|date/i.test(msg) ? 400 : 500
    res.status(code).json({ error: msg })
  }
})

export default router
