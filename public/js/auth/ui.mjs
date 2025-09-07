// public/js/auth/ui.mjs
import { fetchUsers, authBegin, authSetPin, authLogin, authLogout, fetchMe } from './api.mjs';
import { showToast } from '../render/notify.mjs';
import { createAuthModal } from './modal.mjs';

/**
 * Auth UI module: draws the auth box and handles login/logout flows.
 *
 * @param {Object} opts
 * @param {HTMLElement} opts.authbox - container element for auth UI
 * @param {() => any}    opts.getCurrentUser
 * @param {(u:any)=>void}opts.setCurrentUser
 * @param {(enabled:boolean)=>void} opts.setEditEnabled
 */
export function makeAuthUI({
  authbox,
  getCurrentUser,
  setCurrentUser,
  setEditEnabled,
} = {}) {
  async function openLoginModal() {
    try {
      const users = await fetchUsers();
      const modal = createAuthModal();

      modal.mountUserPicker(users, async (user) => {
        try {
          const info = await authBegin(user.id); // { name, needsPinSetup }
          modal.mountPinForm(
            { name: info.name, needsPinSetup: info.needsPinSetup },
            async ({ pin, confirm, needsPinSetup }) => {
              // Validate PIN
              if (!/^\d{4}$/.test(pin || '')) { showToast('PIN must be 4 digits.'); return; }
              if (needsPinSetup && pin !== (confirm || '')) { showToast('PIN mismatch.'); return; }

              try {
                if (needsPinSetup) {
                  await authSetPin(user.id, pin, confirm);
                } else {
                  await authLogin(user.id, pin);
                }

                const me = await fetchMe(); // { id, name, role }
                setCurrentUser(me);
                window.dispatchEvent(new CustomEvent('auth:changed', { detail: me }));

                modal.close();
                render();
                setEditEnabled(true);
              } catch (err) {
                console.error(err);
                showToast('Login failed');
              }
            },
            () => { /* cancel handled inside modal.close() */ }
          );
        } catch (e) {
          console.error(e);
          showToast('Auth failed');
        }
      });
    } catch (e) {
      console.error(e);
      showToast('Failed to load users');
    }
  }

  function render() {
    if (!authbox) return;
    const currentUser = getCurrentUser();
    authbox.innerHTML = '';

    if (currentUser) {
      const span = document.createElement('span');
      span.textContent = `Logged in as ${currentUser.name} • `;

      const btn = document.createElement('button');
      btn.textContent = 'Logout';
      btn.addEventListener('click', async () => {
        try {
          await authLogout();
          setCurrentUser(null);
          window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
          render();
          setEditEnabled(false);
          showToast('Logged out');
        } catch (e) {
          console.error(e);
        }
      });

      authbox.appendChild(span);
      authbox.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.textContent = 'Login';
      btn.addEventListener('click', openLoginModal);
      authbox.appendChild(btn);
    }
  }

  return { render };
}
