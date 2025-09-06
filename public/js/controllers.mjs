// public/js/controllers.mjs
import { wireTableInteractions, wireSorting } from './render.mjs';
import { createView } from './controller/view.mjs';

import { createState } from './controller/state.mjs';
import { setEditEnabled } from './controller/permissions.mjs';
import { createDataLoader } from './controller/dataLoader.mjs';
import { createAuthBridge } from './controller/authBridge.mjs';

/**
 * Creates the frontend controller (composition root).
 */
export function makeFrontendController({
  tableBodySelector = '#tb',
  metaSelector = '#meta',
  headerSelector = 'thead',
  authBoxSelector = '#authbox',
} = {}) {
  const tbody   = document.querySelector(tableBodySelector);
  const meta    = document.querySelector(metaSelector);
  const thead   = document.querySelector(headerSelector);
  const authbox = document.querySelector(authBoxSelector);

  const state = createState();

  // View (table + meta + sort arrow + permission gates)
  const view = createView({ tbody, metaEl: meta, thead, state });
  const rerender = () => view.render();

  // Data loader (handles aborts + rerender)
  const { refetchAndRender, destroy: destroyLoader } = createDataLoader({
    state,
    tbody,
    rerender,
    showLoadError: view.showLoadError,
  });

  // Auth bridge (bootstrap + window auth events)
  const auth = createAuthBridge({
    state,
    authbox,
    setEditEnabled: (enabled) => setEditEnabled(tbody, enabled),
    onAuthChanged: async () => {
      view.render();            // reflect permissions immediately
      await refetchAndRender(); // refresh data (updatedByName, etc.)
    }
  });

  function onSortChange(mode, dir) {
    state.setSort(mode, dir);
    view.reflectSortOnly(); // instant arrow feedback
    refetchAndRender();
  }

  let _inited = false;

  async function init() {
    if (_inited) return;
    _inited = true;

    wireTableInteractions(tbody, { onSaveRequest: refetchAndRender });
    wireSorting(thead, { getState: state.getSort, onSortChange });

    // Bootstrap auth (renders auth UI if logged in)
    await auth.bootstrap();

    // First paint respects admin flag even before data arrives
    view.render();

    // Load list
    await refetchAndRender();
  }

  function destroy() {
    if (!_inited) return;
    _inited = false;

    destroyLoader();
    auth.destroy();
  }

  return { init, reload: refetchAndRender, destroy };
}
