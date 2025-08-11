// File: tests/frontend/renderItems.test.js
/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createItemElement } from '../../public/itemView.mjs'
import { renderItems } from '../../public/renderInventoryTable.mjs'
import { handleAddItem, bindTableDelegation } from '../../public/tableEvents.mjs'

function setupInventoryTable() {
  document.body.innerHTML = `
    <table id="inventory">
      <thead>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Last Updated</th>
          <th>Actions</th>
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
        <tr><th>Name</th><th>Quantity</th><th>Unit</th><th>Last Updated</th><th>Actions</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  `
}

// ------------------------------
// Existing basic tests
// ------------------------------
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
      { id: 1, name: 'Bananas', quantity: 10, unit: 'lbs', lastUpdated: '2025-08-05T17:00:00Z' },
      { id: 2, name: 'Avocados', quantity: 5, unit: 'pcs', lastUpdated: '2025-08-05T16:00:00Z' }
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

    // Default mocks
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    })
    globalThis.alert = vi.fn()
    globalThis.confirm = vi.fn()
  })

  it('adds a new item to inventory when the form is submitted', async () => {
    nameInput.value = 'Bananas'
    quantityInput.value = '10'
    unitInput.value = 'lbs'

    handleAddItem(form, table)
    form.dispatchEvent(new Event('submit', { bubbles: true }))

    await new Promise(res => setTimeout(res, 10))

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }))
    expect(nameInput.value).toBe('')
    expect(quantityInput.value).toBe('')
    expect(unitInput.value).toBe('')
  })
})

// ------------------------------
// New tests: delegation, PATCH, DELETE, XSS, date handling
// ------------------------------
describe('event delegation & actions', () => {
  let table, tbody

  beforeEach(() => {
    setupInventoryTable()
    table = document.getElementById('inventory')
    tbody = table.querySelector('tbody')

    // Render one item
    renderItems([{
      id: 42,
      name: 'Limes',
      quantity: 3,
      unit: 'pcs',
      lastUpdated: '2025-08-05T17:00:00Z'
    }], table)

    // Bind a single delegated listener
    bindTableDelegation(table)

    // Default mocks
    globalThis.fetch = vi.fn()
    globalThis.alert = vi.fn()
    globalThis.confirm = vi.fn()
  })

  function getRowBits() {
    const tr = tbody.querySelector('tr')
    const inputs = tr.querySelectorAll('input.edit')
    const statics = tr.querySelectorAll('span.static')
    const btn = (action) => tr.querySelector(`button[data-action="${action}"]`)
    return { tr, inputs, statics, btn }
  }

  it('Edit toggles inputs visible and statics hidden; Cancel reverts', () => {
    const { inputs, statics, btn } = getRowBits()

    // Initially: inputs hidden, statics visible
    inputs.forEach(i => expect(i.classList.contains('hidden')).toBe(true))
    statics.forEach(s => expect(s.classList.contains('hidden')).toBe(false))

    // Click Edit
    btn('edit').click()
    inputs.forEach(i => expect(i.classList.contains('hidden')).toBe(false))
    statics.forEach(s => expect(s.classList.contains('hidden')).toBe(true))

    // Change input values then Cancel should revert and re-hide inputs
    inputs[0].value = 'Limes!!!'
    inputs[1].value = '99'
    inputs[2].value = 'boxes'

    btn('cancel').click()
    inputs.forEach(i => expect(i.classList.contains('hidden')).toBe(true))
    statics.forEach(s => expect(s.classList.contains('hidden')).toBe(false))

    // Values reset to statics
    expect(inputs[0].value).toBe(statics[0].textContent)
    expect(inputs[1].value).toBe(statics[1].textContent)
    expect(inputs[2].value).toBe(statics[2].textContent)
  })

  it('Save triggers PATCH with updated values then refreshes via GET', async () => {
    const { inputs, btn } = getRowBits()

    // Enter edit mode and change values
    btn('edit').click()
    inputs[0].value = 'Key Limes'
    inputs[1].value = '7'
    inputs[2].value = 'pcs'

    // Mock PATCH then GET (refresh)
    globalThis.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })      // PATCH /api/items/42
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })      // GET /api/items

    btn('save').click()
    await new Promise(res => setTimeout(res, 10))

    // First call: PATCH
    expect(globalThis.fetch.mock.calls[0][0]).toBe('/api/items/42')
    expect(globalThis.fetch.mock.calls[0][1]).toMatchObject({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    })
    const sentBody = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(sentBody).toEqual({ name: 'Key Limes', quantity: 7, unit: 'pcs' })

    // Second call: GET
    expect(globalThis.fetch.mock.calls[1][0]).toBe('/api/items')
    expect(globalThis.fetch.mock.calls[1][1]).toBeUndefined()
  })

  it('Delete respects confirm=false (no request), confirm=true sends DELETE then GET', async () => {
    const { btn } = getRowBits()

    // confirm = false -> no DELETE
    globalThis.confirm.mockReturnValue(false)
    btn('delete').click()
    await new Promise(res => setTimeout(res, 10))
    expect(globalThis.fetch).not.toHaveBeenCalled()

    // confirm = true -> DELETE then GET
    globalThis.fetch.mockReset()
    globalThis.confirm.mockReturnValue(true)

    globalThis.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })   // DELETE
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })   // GET

    btn('delete').click()
    await new Promise(res => setTimeout(res, 10))

    expect(globalThis.fetch.mock.calls[0][0]).toBe('/api/items/42')
    expect(globalThis.fetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE' })
    expect(globalThis.fetch.mock.calls[1][0]).toBe('/api/items')
  })

  it('shows an error banner when PATCH fails', async () => {
    setupFormUI()
    const table = document.getElementById('inventory')
    const tbody = table.querySelector('tbody')

    // Render one row and bind delegation
    renderItems([{ id: 7, name: 'Eggs', quantity: 12, unit: 'pcs', lastUpdated: null }], table)
    const { bindTableDelegation } = await import('../../public/tableEvents.mjs')
    bindTableDelegation(table)

    // First fetch call: PATCH fails; ensure no extra calls after failure
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error', json: () => Promise.resolve({}) })

    // Click Edit -> change -> Save
    tbody.querySelector('button[data-action="edit"]').click()
    const [nameInput, qtyInput, unitInput] = tbody.querySelectorAll('input.edit')
    nameInput.value = 'Eggs XL'
    qtyInput.value = '24'
    unitInput.value = 'pcs'
    tbody.querySelector('button[data-action="save"]').click()

    await new Promise(res => setTimeout(res, 10))

    // Assert PATCH attempted
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(globalThis.fetch.mock.calls[0][0]).toBe('/api/items/7')

    // Assert a banner showed up (no alert())
    expect(globalThis.alert).toBeDefined()
    expect(globalThis.alert).not.toHaveBeenCalled()
    const area = document.querySelector('[data-ui="status-area"]')
    expect(area).toBeTruthy()
    expect(area.textContent).toMatch(/failed|error|server error/i)
  })
})

describe('safety and formatting', () => {
  beforeEach(() => {
    setupInventoryTable()
  })

  it('escapes item name (no HTML execution, no <img> created)', () => {
    const table = document.getElementById('inventory')
    const nasty = `<img src=x onerror=alert(1)>`
    renderItems([{ id: 1, name: nasty, quantity: 1, unit: 'x', lastUpdated: null }], table)

    const tdName = table.querySelector('tbody tr td:nth-child(1)')
    expect(tdName.textContent).toContain(nasty)
    expect(tdName.querySelectorAll('img').length).toBe(0)
  })

  it('leaves lastUpdated blank when missing/invalid', () => {
    const table = document.getElementById('inventory')
    renderItems([{ id: 1, name: 'Test', quantity: 1, unit: 'x', lastUpdated: null }], table)

    const tdDate = table.querySelector('tbody tr td:nth-child(4)')
    expect(tdDate.textContent).toBe('') // fmtDate(null) -> ''
  })
})

