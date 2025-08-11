// tests/inventoryLogic.test.js

import { describe, it, expect } from 'vitest'
import { createItem, updateQuantity } from '../utils/inventoryLogic.js'

describe('createItem', () => {
  it('creates a plain item object with name, quantity, and unit (no timestamp)', () => {
    const item = createItem('Bananas', 12, 'lbs')
    expect(item).toMatchObject({
      name: 'Bananas',
      quantity: 12,
      unit: 'lbs'
    })
    expect(item.lastUpdated).toBeUndefined()
  })

  it('defaults quantity to 0 if not provided (no timestamp)', () => {
    const item = createItem('Almond Milk', undefined, 'qt')
    expect(item).toMatchObject({
      name: 'Almond Milk',
      quantity: 0,
      unit: 'qt'
    })
    expect(item.lastUpdated).toBeUndefined()
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