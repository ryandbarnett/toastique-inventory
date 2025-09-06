// public/js/controller/dataLoader.mjs
import { fetchJuices } from '../api/index.mjs';

export function createDataLoader({ state, tbody, rerender, showLoadError }) {
  let listAbort = null;

  async function refetchAndRender() {
    if (listAbort) listAbort.abort();
    listAbort = new AbortController();
    const { sortMode, sortDir } = state.getSort();

    try {
      const rows = await fetchJuices({ sort: sortMode, dir: sortDir, signal: listAbort.signal });
      state.setCache(rows);
      rerender();
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('refetchAndRender failed:', err);
      if (typeof showLoadError === 'function') {
        showLoadError();
      } else if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6">Failed to load.</td></tr>`;
      }
    } finally {
      listAbort = null;
    }
  }

  const destroy = () => { if (listAbort) listAbort.abort(); };
  return { refetchAndRender, destroy };
}
