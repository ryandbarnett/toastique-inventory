// public/js/controller/authBridge.mjs
import { fetchMe } from '../auth/api.mjs';
import { makeAuthUI } from '../auth/ui.mjs';
import { createListenerBag } from './listeners.mjs';

/**
 * Bridges auth state/UI to the controller without leaking window events.
 * - bootstraps current user via fetchMe()
 * - renders the auth UI
 * - listens for `auth:changed` and invokes onAuthChanged
 */
export function createAuthBridge({ state, authbox, setEditEnabled, onAuthChanged }) {
  const { on, destroyAll } = createListenerBag();

  const authUI = makeAuthUI({
    authbox,
    getCurrentUser: () => state.getUser(),
    setCurrentUser: (u) => state.setUser(u),
    setEditEnabled,
    toastSelector: '#notify',
  });

  async function bootstrap() {
    try {
      const u = await fetchMe(); // { id, name, role }
      state.setUser(u);
      authUI.render();
    } catch {
      // unauthenticated is fine; no-op
    }
  }

  on(window, 'auth:changed', async (e) => {
    state.setUser(e.detail || null);
    if (onAuthChanged) await onAuthChanged(state.getUser());
  });

  return {
    bootstrap,
    destroy: destroyAll,
  };
}
