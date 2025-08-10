// utils/normalize.js

export function normalizeItemInput({ name, quantity, unit }) {
  const cleanName = typeof name === 'string' ? name.trim() : ''
  const cleanUnit = typeof unit === 'string' ? unit.trim() : ''

  let qty
  if (quantity === '' || quantity === undefined || quantity === null) {
    qty = 0
  } else {
    qty = Number(quantity)
  }

  if (!cleanName) return { ok: false, error: 'Name is required' }
  if (!cleanUnit) return { ok: false, error: 'Unit is required' }
  if (Number.isNaN(qty)) return { ok: false, error: 'Quantity must be a number' }

  return { ok: true, value: { name: cleanName, quantity: qty, unit: cleanUnit } }
}
