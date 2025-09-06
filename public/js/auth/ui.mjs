// public/js/auth/ui.mjs
import { fetchUsers, authBegin, authSetPin, authLogin, authLogout, fetchMe } from './api.mjs';

/**
 * Auth UI module: draws the auth box and handles login/logout flows.
 *
 * @param {Object} opts
 * @param {HTMLElement} opts.authbox - container element for auth UI
 * @param {() => any}    opts.getCurrentUser
 * @param {(u:any)=>void}opts.setCurrentUser
 * @param {(enabled:boolean)=>void} opts.setEditEnabled
 * @param {string} [opts.toastSelector='#notify']
 */
export function makeAuthUI({
  authbox,
  getCurrentUser,
  setCurrentUser,
  setEditEnabled,
  toastSelector = '#notify',
} = {}) {
  function showToast(msg) {
    const el = document.querySelector(toastSelector);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.style.display = 'none'; }, 1800);
  }

  function buildModal() {
    const wrapper = document.createElement('div');
    wrapper.className = '__modal';
    wrapper.innerHTML = `
      <div class="__backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.35);"></div>
      <div class="__content" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;max-width:420px;width:92%;padding:16px;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.25);">
          <div class="_body"></div>
        </div>
      </div>
    `;
    wrapper.querySelector('.__backdrop').addEventListener('click', () => wrapper.remove());
    document.body.appendChild(wrapper);
    return wrapper;
  }

  async function openLoginModal() {
    try {
      const users = await fetchUsers();
      const modal = buildModal();
      const body = modal.querySelector('._body');

      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      users.forEach(u => {
        const li = document.createElement('li');
        const a = document.createElement('button');
        a.textContent = u.name;
        a.style.display = 'block';
        a.style.margin = '6px 0';
        a.addEventListener('click', () => pickUser(u, modal));
        li.appendChild(a);
        ul.appendChild(li);
      });
      body.innerHTML = '<h3>Select your name</h3>';
      body.appendChild(ul);
    } catch (e) {
      console.error(e);
      showToast('Failed to load users');
    }
  }

  async function pickUser(user, modal) {
    try {
      const info = await authBegin(user.id); // { name, needsPinSetup }
      const body = modal.querySelector('.__content ._body');
      body.innerHTML = '';

      const h3 = document.createElement('h3');
      h3.textContent = `Hi, ${info.name}`;
      body.appendChild(h3);

      const form = document.createElement('form');
      form.innerHTML = `
        <label style="display:block;margin:8px 0;">
          Enter 4-digit PIN
          <input required maxlength="4" inputmode="numeric" pattern="\\d{4}" class="_pin" />
        </label>
        ${info.needsPinSetup ? `
        <label style="display:block;margin:8px 0;">
          Confirm PIN
          <input required maxlength="4" inputmode="numeric" pattern="\\d{4}" class="_confirm" />
        </label>` : ''}
        <div style="margin-top:10px;">
          <button type="submit">${info.needsPinSetup ? 'Set PIN & Login' : 'Login'}</button>
          <button type="button" class="_cancel">Cancel</button>
        </div>
      `;
      body.appendChild(form);

      form.querySelector('._cancel').addEventListener('click', () => modal.remove());
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = form.querySelector('._pin')?.value?.trim();
        if (!/^\d{4}$/.test(pin)) return showToast('PIN must be 4 digits.');
        try {
          // Perform auth (these return only {id,name})
          if (info.needsPinSetup) {
            const confirm = form.querySelector('._confirm')?.value?.trim();
            if (confirm !== pin) return showToast('PIN mismatch.');
            await authSetPin(user.id, pin, confirm);
          } else {
            await authLogin(user.id, pin);
          }

          // 🔁 Fetch the full user (with role) and broadcast
          const me = await fetchMe(); // { id, name, role }
          setCurrentUser(me);
          window.dispatchEvent(new CustomEvent('auth:changed', { detail: me }));

          modal.remove();
          render(); // refresh auth box
          setEditEnabled(true);
        } catch (err) {
          console.error(err);
          showToast('Login failed');
        }
      });
    } catch (e) {
      console.error(e);
      showToast('Auth failed');
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
        } catch (e) { console.error(e); }
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
