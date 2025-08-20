// app.js
import express from 'express'
import juiceRoutes from './routes/juices.js'
import batchRoutes from './routes/batches.js'
import { makeRepo } from './lib/repo/index.js'
import { makeService } from './lib/service/index.js'

/**
 * Create and configure the Express app.
 * You can inject a pre-built service (for tests), or it will build one by default.
 * @param {{ service?: ReturnType<typeof makeService> }} [deps]
 */
export function createApp(deps = {}) {
  const app = express()
  app.use(express.json())
  app.use(express.static('public'))

  // Build default service if none is provided (prod/dev usage).
  const service = deps.service ?? makeService(makeRepo())

  // Pass service into route factories
  app.use('/api', juiceRoutes(service))
  app.use('/api', batchRoutes(service))

  app.get('/', (_req, res) => res.redirect('/juices.html'))
  return app
}
