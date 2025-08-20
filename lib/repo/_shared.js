// lib/repo/_shared.js

/** Whitelist of updatable fields for batches */
export const FIELD_MAP = {
  batchUpdatable: {
    remainingLiters: 'remaining_liters',
    disposedAt: 'disposed_at',
    note: 'note',
    expiresAt: 'expires_at',
  },
};

/**
 * Build a safe SQL SET clause from a JS patch object using a whitelist map.
 * Unknown keys are ignored.
 * @param {Record<string, unknown>} patch
 * @param {Record<string, string>} map
 * @returns {{ setSql: string, args: unknown[] }}
 */
export function buildSetClause(patch = {}, map) {
  const sets = [];
  const args = [];
  for (const [key, val] of Object.entries(patch)) {
    const col = map[key];
    if (!col) continue;
    sets.push(`${col} = ?`);
    args.push(val);
  }
  return { setSql: sets.length ? sets.join(', ') : '', args };
}
