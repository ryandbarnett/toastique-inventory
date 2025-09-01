// auth/pinHelpers.mjs
export function isValidPin(pin) {
  // Rejects null/undefined and trims whitespace before testing
  if (pin == null) return false
  return /^\d{4}$/.test(String(pin).trim())
}
