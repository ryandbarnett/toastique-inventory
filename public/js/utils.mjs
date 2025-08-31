// public/js/utils.mjs

/**
 * Derive status from a juice record.
 * OK: current >= par
 * BELOW PAR: 0 < current < par
 * OUT: current <= 0 (or invalid)
 */
export function getStatus(j) {
  const cur = Number(j?.currentLiters);
  const par = Number(j?.parLiters);
  if (!Number.isFinite(cur) || cur <= 0) return 'OUT';
  if (Number.isFinite(par) && cur < par) return 'BELOW PAR';
  return 'OK';
}

/**
 * 3-letter code from a name (e.g., "Apple Juice" -> "AJ", "Ginger" -> "GIN").
 * Falls back to first 3 alphanumerics uppercased.
 */
export function code3(name = '') {
  const words = String(name).trim().toUpperCase().split(/\s+/).filter(Boolean);
  let code = words.length > 1
    ? words.map(w => w[0]).join('')            // initials for multi-word
    : String(name).toUpperCase().replace(/[^A-Z0-9]/g, ''); // strip non-alnum
  code = code.slice(0, 3);
  return code || '???';
}

/**
 * Nicely format an ISO date/time for display.
 */
export function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '';
  // Localized, readable (e.g., "Aug 24, 2025, 09:12 AM")
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}
