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
    parts.push(
      `<span class="stale-meta"><span class="stale-icon">⚠️</span> ${stale} stale</span>`
    );
  }
  metaEl.innerHTML = `${parts.join(' • ')} — sorted by ${sortLabel} (${arrow})`;
}
