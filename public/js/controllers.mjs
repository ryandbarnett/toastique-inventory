// public/js/controllers.mjs
// Orchestrates state + wiring
import { fetchJuices } from './api.mjs';
import { fetchMe } from './auth/api.mjs';
import { makeAuthUI } from './auth/ui.mjs';
import { renderTable, wireTableInteractions, wireSorting, applySortHeaderState } from './render.mjs';

export function makeFrontendController({
  tableBodySelector = '#tb',
  metaSelector = '#meta',
  headerSelector = 'thead',
  authBoxSelector = '#authbox',
} = {}) {
  const tbody = document.querySelector(tableBodySelector);
  const meta  = document.querySelector(metaSelector);
  const thead = document.querySelector(headerSelector);
  const authbox = document.querySelector(authBoxSelector);

  let cache = [];
  let sortMode = 'name';  // 'name' | 'status'
  let sortDir  = 'asc';   // 'asc'  | 'desc'
  let currentUser = null;  // { id, name } | null
  const isAdmin = () => currentUser?.role === 'admin';

  function getState() { return { sortMode, sortDir }; }

  function setMeta({ total, below, out }, { sortMode, sortDir }) {
    if (!meta) return;
    const labels = { name: 'Name', status: 'Status' };
    const arrow = sortDir === 'asc' ? '↑' : '↓';
    const sortLabel = labels[sortMode] ?? sortMode;
    meta.textContent = `${total} juices • ${below} below PAR • ${out} out — sorted by ${sortLabel} (${arrow})`;
  }

  function setEditEnabled(enabled) {
    // Gate inputs/buttons visually when logged out
    tbody.querySelectorAll('.liters-input').forEach(i => { i.disabled = !enabled; });
    tbody.querySelectorAll('.save-btn').forEach(b => { b.disabled = !enabled; });
  }

  // Auth UI (moved to public/js/auth/ui.mjs)
  const authUI = makeAuthUI({
    authbox,
    getCurrentUser: () => currentUser,
    setCurrentUser: (u) => { currentUser = u; },
    setEditEnabled,
    toastSelector: '#notify',
  });

  function rerender() {
    console.debug('rerender → currentUser:', currentUser, 'isAdmin:', currentUser?.role === 'admin');
    const counts = renderTable(tbody, cache, { sortMode, sortDir, isAdmin: isAdmin() });
    setMeta(counts, { sortMode, sortDir });
    applySortHeaderState(thead, { sortMode, sortDir });
    // enforce editability:
    // - liters inputs require any login (existing behavior)
    // - PAR inputs require admin
    setEditEnabled(!!currentUser);
    tbody.querySelectorAll('.par-input, .save-par-btn').forEach(el => {
      el.disabled = !isAdmin();
    });
  }

  async function refetchAndRender() {
    cache = await fetchJuices({ sort: sortMode, dir: sortDir });
    rerender();
  }

  function onSortChange(mode, dir) {
    sortMode = mode;
    sortDir = dir;
    refetchAndRender();
  }

  async function init() {
    wireTableInteractions(tbody, { onSaveRequest: refetchAndRender });
    wireSorting(thead, { getState, onSortChange });

    try {
      const u = await fetchMe();  // expect { id, name, role } after our backend change
      currentUser = u;
      console.debug('init → fetchMe():', u);
      authUI.render();
      // Ensure first paint respects admin flag even before data loads
      rerender();
    } catch (err) {
      console.debug('fetchMe error:', err?.message || err);
    }

    // 🔔 React to login/logout from the auth UI
    window.addEventListener('auth:changed', async (e) => {
      currentUser = e.detail || null; // { id, name, role } or null
      // Paint immediately so the PAR editor toggles correctly
      rerender();
      // Then refresh the data (status text, updatedByName, etc.)
      await refetchAndRender();
    });

    try {
      await refetchAndRender();
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6">Failed to load.</td></tr>`;
    }
  }

  return { init, reload: refetchAndRender };
}
