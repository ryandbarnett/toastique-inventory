// public/js/utils.mjs

export const STATUS = {
  OK: 'OK',
  BELOW: 'BELOW PAR',
  OUT: 'OUT',
};

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Derive status from a juice record.
 * OK: current >= par
 * BELOW PAR: 0 < current < par
 * OUT: current <= 0 (or invalid)
 */
export function getStatus(j) {
  const cur = safeNum(j?.currentLiters);
  const par = safeNum(j?.parLiters);
  if (!Number.isFinite(cur) || cur <= 0) return STATUS.OUT;
  if (Number.isFinite(par) && cur < par) return STATUS.BELOW;
  return STATUS.OK;
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
  // Reuse a single formatter (perf)
  if (!fmtDate._fmt) {
    fmtDate._fmt = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return fmtDate._fmt.format(d);
}

export function isStale(iso, hours = 24) {
  if (!iso) return true;
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return true;
  return (Date.now() - d.getTime()) > hours * 60 * 60 * 1000;
}