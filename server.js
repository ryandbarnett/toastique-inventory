import express from 'express'
import inventoryRoutes from './routes/inventory.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api', inventoryRoutes)

app.listen(PORT, () => {
  console.log(`Inventory app running at http://localhost:${PORT}`)
})