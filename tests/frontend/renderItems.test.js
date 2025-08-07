// File: tests/frontend/renderItems.test.js
/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createItemElement, renderItems, handleAddItem } from '../../public/app.js'

function setupInventoryTable() {
  document.body.innerHTML = `
    <table id="inventory">
      <thead>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `
}

function setupFormUI() {
  document.body.innerHTML = `
    <form id="add-item-form">
      <input type="text" id="name" />
      <input type="number" id="quantity" />
      <input type="text" id="unit" />
      <button type="submit">Add</button>
    </form>
    <table id="inventory">
      <thead>
        <tr><th>Name</th><th>Quantity</th><th>Unit</th><th>Last Updated</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  `
}

describe('createItemElement', () => {
  it('creates a div with correct text', () => {
    const item = { name: 'Apples', quantity: 5, unit: 'lbs' }
    const div = createItemElement(item)
    expect(div).toBeInstanceOf(HTMLDivElement)
    expect(div.textContent).toBe('Apples - 5 lbs')
  })
})

describe('renderItems', () => {
  let tbody

  beforeEach(() => {
    setupInventoryTable()
    tbody = document.querySelector('#inventory tbody')
  })

  it('renders a list of items into the inventory table', () => {
    const items = [
      { name: 'Bananas', quantity: 10, unit: 'lbs', lastUpdated: '2025-08-05T17:00:00Z' },
      { name: 'Avocados', quantity: 5, unit: 'pcs', lastUpdated: '2025-08-05T16:00:00Z' }
    ]

    const table = document.getElementById('inventory')
    renderItems(items, table)

    expect(tbody.children.length).toBe(2)
    expect(tbody.textContent).toContain('Bananas')
    expect(tbody.textContent).toContain('Avocados')
  })
})

describe('frontend inventory UI', () => {
  let form, nameInput, quantityInput, unitInput, table, tbody

  beforeEach(() => {
    setupFormUI()

    form = document.getElementById('add-item-form')
    nameInput = document.getElementById('name')
    quantityInput = document.getElementById('quantity')
    unitInput = document.getElementById('unit')
    table = document.getElementById('inventory')
    tbody = table.querySelector('tbody')

    // Mock fetch to always return success
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]) // simulate updated inventory response
    })

    // Stub alert if still used somewhere
    globalThis.alert = vi.fn()
  })

  it('adds a new item to inventory when the form is submitted', async () => {
    nameInput.value = 'Bananas'
    quantityInput.value = '10'
    unitInput.value = 'lbs'

    handleAddItem(form, table)

    form.dispatchEvent(new Event('submit', { bubbles: true }))

    // Wait a tick for async DOM changes
    await new Promise(res => setTimeout(res, 10))

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/items', expect.any(Object))
    expect(nameInput.value).toBe('')
    expect(quantityInput.value).toBe('')
    expect(unitInput.value).toBe('')
  })
})