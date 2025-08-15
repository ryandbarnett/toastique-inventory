// server.js

import express from 'express'
import juiceRoutes from './routes/juices.js'
import batchRoutes from './routes/batches.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

// API routes
app.use('/api', juiceRoutes)
app.use('/api', batchRoutes)

app.get('/', (_req, res) => res.redirect('/juices.html'))

app.listen(PORT, () => {
  console.log(`Juice inventory app running at http://localhost:${PORT}`)
})