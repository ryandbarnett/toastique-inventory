// public/js/controller/meta.mjs
export function setMeta(metaEl, { total, below, out }, { sortMode, sortDir }) {
  if (!metaEl) return;
  const labels = { name: 'Name', status: 'Status' };
  const arrow = sortDir === 'asc' ? '↑' : '↓';
  const sortLabel = labels[sortMode] ?? sortMode;
  metaEl.textContent = `${total} juices • ${below} below PAR • ${out} out — sorted by ${sortLabel} (${arrow})`;
}
