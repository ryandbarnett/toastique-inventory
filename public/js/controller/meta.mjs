// public/js/controller/meta.mjs
export function setMeta(metaEl, { total, below, out, stale }, { sortMode, sortDir }) {
  if (!metaEl) return;
  const labels = { name: 'Name', status: 'Status' };
  const arrow = sortDir === 'asc' ? '↑' : '↓';
  const sortLabel = labels[sortMode] ?? sortMode;
  const parts = [
    `${total} juices`,
    `${below} below PAR`,
    `${out} out`,
  ];
  if (stale > 0) {
    parts.push(`⚠️ ${stale} stale`);
  }
  metaEl.textContent = `${parts.join(' • ')} — sorted by ${sortLabel} (${arrow})`;
}
