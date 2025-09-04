// packages/auth/src/crypto/pin.mjs
import bcrypt from 'bcryptjs'

export function isValidPin(pin) {
  if (pin == null) return false
  return /^\d{4}$/.test(String(pin).trim())
}

// Use env or sensible default; 10–12 is a good balance
const DEFAULT_COST = Number(process.env.BCRYPT_COST || 12)

/**
 * Hash a 4-digit PIN with bcrypt.
 * @param {string|number} pin
 * @param {number} cost - bcrypt cost factor
 */
export async function hashPin(pin, cost = DEFAULT_COST) {
  const str = String(pin).trim()
  if (!isValidPin(str)) throw new Error('Invalid PIN format')
  return bcrypt.hash(str, cost)
}

/**
 * Constant-time verify of a PIN against a bcrypt hash.
 * @param {string|number} pin
 * @param {string} hash
 */
export async function verifyPin(pin, hash) {
  const str = String(pin).trim()
  if (!isValidPin(str)) return false
  // bcrypt.compare is constant-time for same-length hashes
  return bcrypt.compare(str, hash)
}
