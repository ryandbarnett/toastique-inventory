// app.js
import express from 'express'
import juiceRoutes from './routes/juices.js'
import batchRoutes from './routes/batches.js'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use(express.static('public'))

  app.use('/api', juiceRoutes)
  app.use('/api', batchRoutes)

  app.get('/', (_req, res) => res.redirect('/juices.html'))
  return app
}
