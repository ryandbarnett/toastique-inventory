// public/js/controller/view.mjs
import { renderTable, applySortHeaderState } from '../render.mjs';
import { setMeta } from './meta.mjs';
import { setEditEnabled, applyAdminGates } from './permissions.mjs';

export function createView({ tbody, metaEl, thead, state }) {
  function render() {
    const counts = renderTable(tbody, state.getCache(), {
      ...state.getSort(),
      isAdmin: state.isAdmin(),
    });

    setMeta(metaEl, counts, state.getSort());
    applySortHeaderState(thead, state.getSort());

    setEditEnabled(tbody, !!state.getUser());
    applyAdminGates(tbody, state.isAdmin());
  }

  function reflectSortOnly() {
    applySortHeaderState(thead, state.getSort());
  }

  function showLoadError() {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6">Failed to load.</td></tr>`;
  }

  return { render, reflectSortOnly, showLoadError };
}
