import express from 'express'
import { createItem } from '../utils/inventoryLogic.js'
import { getDb } from '../utils/db.js'
import { normalizeItemInput, normalizePatchInput } from '../utils/normalize.js'

const router = express.Router()

router.post('/items', async (req, res) => {
  const db = await getDb()
  try {
    const check = normalizeItemInput(req.body)
    if (!check.ok) return res.status(400).json({ error: check.error })
    const { name, quantity, unit, par } = check.value
    const item = createItem(name, quantity, unit)
    const lastUpdated = new Date().toISOString()
    const result = await db.run(
      `INSERT INTO inventory (name, quantity, unit, lastUpdated, par) VALUES (?,?,?,?,?)`,
      [item.name, item.quantity, item.unit, lastUpdated, par]
    )
    const row = await db.get(`SELECT * FROM inventory WHERE id = ?`, [result.lastID])
    res.status(201).json(row)
  } catch (err) {
    console.error('Failed to create item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/items/:id', async (req, res) => {
  const { id } = req.params
  const db = await getDb()

  try {
    // 1) Load existing row
    const existing = await db.get(`SELECT * FROM inventory WHERE id = ?`, [id])
    if (!existing) return res.status(404).json({ error: 'Item not found' })

    // 2) Validate the partial body
    const p = normalizePatchInput(req.body)
    if (!p.ok) return res.status(400).json({ error: p.error })

    // 3) Merge onto existing and run full validation
    const merged = {
      name: 'name' in p.value ? p.value.name : existing.name,
      unit: 'unit' in p.value ? p.value.unit : existing.unit,
      quantity: 'quantity' in p.value ? p.value.quantity : existing.quantity,
      par: 'par' in p.value ? p.value.par : existing.par
    }
    const finalCheck = normalizeItemInput(merged)
    if (!finalCheck.ok) return res.status(400).json({ error: finalCheck.error })
    const { name, quantity, unit, par } = finalCheck.value

    // 4) Persist
    const result = await db.run(
      `UPDATE inventory
       SET name = ?, quantity = ?, unit = ?, par = ?, lastUpdated = ?
       WHERE id = ?`,
      [name, quantity, unit, par, new Date().toISOString(), id]
    )
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' })

    // 5) Return updated row
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
