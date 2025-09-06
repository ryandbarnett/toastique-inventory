// public/js/render/sort.mjs
export function wireSorting(thead, { getState, onSortChange }) {
  thead.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sort]');
    if (!th) return;
    const mode = th.getAttribute('data-sort'); // 'name' | 'status'
    const { sortMode, sortDir } = getState();
    const nextDir = sortMode === mode ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    onSortChange(mode, nextDir);
  });
}

export function applySortHeaderState(thead, { sortMode, sortDir }) {
  thead.querySelectorAll('th[data-sort]').forEach(h => h.classList.remove('active', 'desc'));
  const th = thead.querySelector(`th[data-sort="${sortMode}"]`);
  if (th) {
    th.classList.add('active');
    if (sortDir === 'desc') th.classList.add('desc');
  }
}
