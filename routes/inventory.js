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

router.patch('/items/:name', async (req, res) => {
  const { name } = req.params
  const { amount } = req.body

  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Amount must be a number' })
  }

  const db = await getDb()

  try {
    // Get current item
    const existingItem = await db.get(
      `SELECT * FROM inventory WHERE LOWER(name) = LOWER(?)`,
      [name]
    )

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Update quantity and timestamp
    const updated = updateQuantity(existingItem, amount)

    await db.run(
      `UPDATE inventory SET quantity = ?, lastUpdated = ? WHERE id = ?`,
      [updated.quantity, updated.lastUpdated, existingItem.id]
    )

    res.json({
      id: existingItem.id,
      name: existingItem.name,
      unit: existingItem.unit,
      ...updated
    })
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

router.delete('/items/:name', async (req, res) => {
  const { name } = req.params
  const db = await getDb()

  try {
    const result = await db.run(
      `DELETE FROM inventory WHERE LOWER(name) = LOWER(?)`,
      [name]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json({ message: `Deleted item '${name}'` })
  } catch (err) {
    console.error('Failed to delete item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router