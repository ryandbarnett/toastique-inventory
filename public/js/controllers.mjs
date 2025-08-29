// public/js/controllers.mjs
// Orchestrates state + wiring
import {fetchJuices, fetchMe, fetchUsers, authBegin, authSetPin, authLogin, authLogout } from './api.mjs';
import { renderTable, wireSaves, wireSorting, applySortHeaderState } from './render.mjs';

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

  function renderAuthBox() {
    if (!authbox) return;
    authbox.innerHTML = '';
    if (currentUser) {
      const span = document.createElement('span');
      span.textContent = `Logged in as ${currentUser.name} • `;
      const btn = document.createElement('button');
      btn.textContent = 'Logout';
      btn.addEventListener('click', async () => {
        try {
          await authLogout();
          currentUser = null;
          renderAuthBox();
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

  // Minimal modal: list users → choose name → show PIN inputs (first-time: PIN+Confirm)
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
          if (info.needsPinSetup) {
            const confirm = form.querySelector('._confirm')?.value?.trim();
            if (confirm !== pin) return showToast('PIN mismatch.');
            currentUser = await authSetPin(user.id, pin, confirm);
          } else {
            currentUser = await authLogin(user.id, pin);
          }
          modal.remove();
          renderAuthBox();
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

  function showToast(msg) {
    const el = document.getElementById('notify');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.style.display = 'none'; }, 1800);
  }

  function rerender() {
    const counts = renderTable(tbody, cache, { sortMode, sortDir });
    setMeta(counts, { sortMode, sortDir });
    applySortHeaderState(thead, { sortMode, sortDir });
    // enforce editability based on auth state
    setEditEnabled(!!currentUser);
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
    // fetch session & paint header
    fetchMe().then(u => { currentUser = u; renderAuthBox(); }).catch(console.error);
    // initial data render
    refetchAndRender().catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6">Failed to load.</td></tr>`;
    });
  }

  return { init, reload: refetchAndRender };
}
