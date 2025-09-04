// lib/http/routes/juices.mjs
import express from 'express'
import { listJuices, updateJuiceLiters } from '../../service/juices.js'

/**
 * @param {{ juicesRepo: any, usersRepo: any, requireAuth: Function }} deps
 */
export function makeJuicesRouter({ juicesRepo, usersRepo, requireAuth }) {
  const r = express.Router()

  // GET /api/juices  (?sort=name|status&dir=asc|desc)
  r.get('/', (req, res, next) => {
    try {
      const sort = req.query.sort
      const dir  = req.query.dir
      res.json(listJuices({ repo: juicesRepo, sort, dir }))
    } catch (err) { next(err) }
  })

  // PUT /api/juices/:id/liters (protected)
  r.put('/:id/liters', requireAuth, (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const liters = req.body?.liters
      const userId = req.session.userId
      const result = updateJuiceLiters({ repo: juicesRepo, users: usersRepo, id, liters, userId })
      if (result?.ok) return res.json(result.body)
      if (result?.error) return res.status(result.error).json(result.body)
      throw new Error('Unexpected updateJuiceLiters result')
    } catch (err) { next(err) }
  })

  return r
}
