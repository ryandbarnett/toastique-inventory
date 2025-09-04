export function isValidPin(pin) {
  if (pin == null) return false
  return /^\d{4}$/.test(String(pin).trim())
}
