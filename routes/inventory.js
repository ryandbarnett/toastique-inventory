// File: routes/inventory.js

import express from 'express'
import { createItem, updateQuantity } from '../utils/inventoryLogic.js'
import { getDb } from '../utils/db.js'

const router = express.Router()

router.post('/items', async (req, res) => {
  const db = await getDb()
  try {
    const { name, quantity, unit } = req.body
    const item = createItem(name, quantity, unit)
    const lastUpdated = new Date().toISOString()
    const result = await db.run(
      `INSERT INTO inventory (name, quantity, unit, lastUpdated) VALUES (?,?,?,?)`,
      [item.name, item.quantity, item.unit, lastUpdated]
    )
    const row = await db.get(`SELECT * FROM inventory WHERE id = ?`, [result.lastID])
    res.status(201).json(row)
  } catch (err) {
    console.error('Failed to create item:', err)
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
    const row = await db.get(`SELECT * FROM inventory WHERE id = ?`, [id])
    res.json(row)
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