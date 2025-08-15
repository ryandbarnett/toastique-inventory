// routes/batches.js
import express from 'express'
import { updateBatch } from '../lib/service.js'
const router = express.Router()

router.patch('/batches/:batchId', async (req, res) => {
  try {
    const bid = Number(req.params.batchId)
    const updated = await updateBatch(bid, req.body || {})
    res.json({ ok: true, batch: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const code = /not found|invalid|must be|date/i.test(msg) ? 400 : 500
    res.status(code).json({ error: msg })
  }
})

export default router
