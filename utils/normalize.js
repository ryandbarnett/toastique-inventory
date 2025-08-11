// utils/normalize.js

export function normalizeItemInput({ name, quantity, unit, par }) {
  const cleanName = typeof name === 'string' ? name.trim() : ''
  const cleanUnit = typeof unit === 'string' ? unit.trim() : ''

  let qty
  if (quantity === '' || quantity === undefined || quantity === null) {
    qty = 0
  } else {
    qty = Number(quantity)
  }

  // Require par to be present
  if (par === '' || par === undefined || par === null) {
    return { ok: false, error: 'Par is required' }
  }

  const cleanPar = Number(par)

  if (!cleanName) return { ok: false, error: 'Name is required' }
  if (!cleanUnit) return { ok: false, error: 'Unit is required' }
  if (Number.isNaN(qty)) return { ok: false, error: 'Quantity must be a number' }
  if (Number.isNaN(cleanPar)) return { ok: false, error: 'Par must be a number' }
  if (cleanPar < 0) return { ok: false, error: 'Par must be ≥ 0' }

  return {
    ok: true,
    value: {
      name: cleanName,
      quantity: qty,
      unit: cleanUnit,
      par: cleanPar
    }
  }
}

export function normalizePatchInput(body = {}) {
  const out = {}
  let touched = false

  // name (optional)
  if ('name' in body) {
    touched = true
    const cleanName = typeof body.name === 'string' ? body.name.trim() : ''
    if (!cleanName) return { ok: false, error: 'Name is required' }
    out.name = cleanName
  }

  // unit (optional)
  if ('unit' in body) {
    touched = true
    const cleanUnit = typeof body.unit === 'string' ? body.unit.trim() : ''
    if (!cleanUnit) return { ok: false, error: 'Unit is required' }
    out.unit = cleanUnit
  }

  // quantity (optional; same coercion as POST: '' -> 0, else Number, error if NaN)
  if ('quantity' in body) {
    touched = true
    let qty
    if (body.quantity === '' || body.quantity === undefined || body.quantity === null) {
      qty = 0
    } else {
      qty = Number(body.quantity)
    }
    if (Number.isNaN(qty)) return { ok: false, error: 'Quantity must be a number' }
    out.quantity = qty
  }

  // par (optional; if present must be a number >= 0)
  if ('par' in body) {
    touched = true
    if (body.par === '' || body.par === undefined || body.par === null) {
      return { ok: false, error: 'Par must be a number' }
    }
    const cleanPar = Number(body.par)
    if (Number.isNaN(cleanPar)) return { ok: false, error: 'Par must be a number' }
    if (cleanPar < 0) return { ok: false, error: 'Par must be ≥ 0' }
    out.par = cleanPar
  }

  if (!touched) {
    return { ok: false, error: 'No updatable fields' }
  }

  return { ok: true, value: out }
}