import express from 'express'
import { createItem, updateQuantity } from '../utils/inventoryLogic.js'
import { getDb } from '../utils/db.js'

const router = express.Router()

router.post('/items', async (req, res) => {
  const { name, quantity, unit } = req.body

  if (!name || !unit) {
    return res.status(400).json({ error: 'Name and unit are required' })
  }

  const db = await getDb()

  const newItem = createItem(name, quantity, unit)

  try {
    const result = await db.run(
      `INSERT INTO inventory (name, quantity, unit, lastUpdated)
       VALUES (?, ?, ?, ?)`,
      [newItem.name, newItem.quantity, newItem.unit, newItem.lastUpdated]
    )

    // Include DB-assigned ID in the response
    res.status(201).json({
      id: result.lastID,
      ...newItem
    })
  } catch (err) {
    console.error('Failed to insert item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /items/:id — full update (name, quantity, unit)
router.patch('/items/:id', async (req, res) => {
  const { id } = req.params
  const { name, quantity, unit } = req.body

  if (!name || typeof quantity !== 'number' || !unit) {
    return res.status(400).json({ error: 'Name, quantity, and unit are required' })
  }

  const db = await getDb()

  try {
    const result = await db.run(
      `UPDATE inventory
       SET name = ?, quantity = ?, unit = ?, lastUpdated = ?
       WHERE id = ?`,
      [name, quantity, unit, new Date().toISOString(), id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json({ message: `Updated item with ID ${id}` })
  } catch (err) {
    console.error('Failed to update item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/items', async (req, res) => {
  const db = await getDb()

  try {
    const items = await db.all(`SELECT * FROM inventory ORDER BY name COLLATE NOCASE`)
    res.json(items)
  } catch (err) {
    console.error('Failed to fetch items:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/items/:id', async (req, res) => {
  const { id } = req.params
  const db = await getDb()

  try {
    const result = await db.run(
      `DELETE FROM inventory WHERE id = ?`,
      [id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json({ message: `Deleted item with ID ${id}` })
  } catch (err) {
    console.error('Failed to delete item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router