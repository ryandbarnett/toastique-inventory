import { describe, it, expect } from 'vitest'
import { createItem, updateQuantity } from '../utils/inventoryLogic.js'

describe('createItem', () => {
  it('creates an item with name, quantity, and unit', () => {
    const item = createItem('Bananas', 12, 'lbs')
    expect(item).toMatchObject({
      name: 'Bananas',
      quantity: 12,
      unit: 'lbs'
    })
    expect(typeof item.lastUpdated).toBe('string')
  })

  it('defaults quantity to 0 if not provided', () => {
    const item = createItem('Almond Milk', undefined, 'qt')
    expect(item).toMatchObject({
      name: 'Almond Milk',
      quantity: 0,
      unit: 'qt'
    })
    expect(typeof item.lastUpdated).toBe('string')
  })

  it('includes a lastUpdated timestamp', () => {
    const before = Date.now()
    const item = createItem('Avocados', 5, 'pcs')
    const after = Date.now()

    const timestamp = new Date(item.lastUpdated).getTime()
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })
})

describe('updateQuantity', () => {
  it('adds to the quantity', () => {
    const item = { name: 'Bananas', quantity: 10 }
    const result = updateQuantity(item, 5)
    expect(result.quantity).toBe(15)
  })

  it('subtracts from the quantity', () => {
    const item = { name: 'Bananas', quantity: 10 }
    const result = updateQuantity(item, -3)
    expect(result.quantity).toBe(7)
  })
})