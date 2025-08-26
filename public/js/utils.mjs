// Pure helpers (no DOM)
export const STATUS_ORDER = { OUT: 0, 'BELOW PAR': 1, OK: 2 };

export function computeStatus(j) {
  if (j.currentLiters <= 0) return 'OUT';
  if (j.currentLiters >= j.parLiters) return 'OK';
  return 'BELOW PAR';
}

export function getStatus(j) {
  // Option A: frontend owns status
  return computeStatus(j);
}

export function code3(name) {
  const letters = (name || '').replace(/[^A-Za-z]/g, '');
  return letters.slice(0, 3).toUpperCase();
}

export function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
