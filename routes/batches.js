// routes/batches.js
import express from 'express'

/**
 * @param {{ updateBatch:Function }} service
 */
export default function batchesRouter(service) {
  const router = express.Router()

  router.patch('/batches/:id', async (req, res) => {
    try {
      const id = Number(req.params.id)
      const updated = await service.updateBatch(id, req.body || {})
      res.json({ ok: true, batch: updated })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Internal server error'
      const code = /not found|invalid|required|date|updatable/i.test(msg) ? 400 : 500
      res.status(code).json({ error: msg })
    }
  })

  return router
}
