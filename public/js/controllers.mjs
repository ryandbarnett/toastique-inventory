// Orchestrates state + wiring
import { fetchJuices } from './api.mjs';
import { renderTable, wireSaves, wireSorting, applySortHeaderState } from './render.mjs';

export function makeFrontendController({
  tableBodySelector = '#tb',
  metaSelector = '#meta',
  headerSelector = 'thead',
} = {}) {
  const tbody = document.querySelector(tableBodySelector);
  const meta  = document.querySelector(metaSelector);
  const thead = document.querySelector(headerSelector);

  let cache = [];
  let sortMode = 'name';  // 'name' | 'status'
  let sortDir  = 'asc';   // 'asc'  | 'desc'

  function getState() { return { sortMode, sortDir }; }

  function setMeta({ total, below, out }) {
    if (!meta) return;
    meta.textContent = `${total} juices • ${below} below PAR • ${out} out`;
  }

  function rerender() {
    const counts = renderTable(tbody, cache, { sortMode, sortDir });
    setMeta(counts);
    applySortHeaderState(thead, { sortMode, sortDir });
  }

  async function refetchAndRender() {
    cache = await fetchJuices();
    rerender();
  }

  function onSortChange(mode, dir) {
    sortMode = mode;
    sortDir = dir;
    rerender();
  }

  function init() {
    wireSaves(tbody, { onSaveRequest: refetchAndRender });
    wireSorting(thead, { getState, onSortChange });
    refetchAndRender().catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6">Failed to load.</td></tr>`;
    });
  }

  return { init, reload: refetchAndRender };
}
