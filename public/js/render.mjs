// public/js/render.mjs
// Rendering + delegated events (DOM only)
import { code3, getStatus, fmtDate } from './utils.mjs';
import { updateLiters, updatePar } from './api.mjs';

export function renderTable(tbody, juices, { sortMode, sortDir, isAdmin = false } = {}) {
  tbody.innerHTML = '';

  // Server-side sorting: render exactly in the order provided
  const list = juices;

  let below = 0;
  let out = 0;

  for (const j of list) {
    const status = getStatus(j);
    if (status === 'BELOW PAR') below++;
    if (status === 'OUT') out++;

    const statusClass = status === 'OK' ? 'ok' : status === 'OUT' ? 'out' : 'low';
    const shortAttr = status === 'BELOW PAR' ? 'data-short="LOW"' : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="name-col">
        <span class="name-code"><abbr title="${j.name}">${code3(j.name)}</abbr></span>
        <span class="name-full">${j.name}</span>
      </td>
      <td>
        ${
          isAdmin
            ? `
            <input
              class="par-input"
              type="number"
              step="0.5"
              min="0"
              max="10"
              inputmode="decimal"
              enterkeyhint="done"
              value="${j.parLiters}"
              aria-label="New PAR for ${j.name}"
              data-id="${j.id}"
              data-name="${j.name}"
            />
            <button class="save-par-btn" data-id="${j.id}">Save</button>
            `
          : `${j.parLiters}`
        }
      </td>
      <td>${j.currentLiters}</td>
      <td>
        <span class="status ${statusClass}" ${shortAttr}>${status}</span>
      </td>
      <td class="muted" title="${(j.updatedByName ? j.updatedByName + ' · ' : '') + (j.lastUpdated || '')}">
        ${j.updatedByName ? `${j.updatedByName} · ` : ''}
        ${j.lastUpdated ? fmtDate(j.lastUpdated) : '—'}
      </td>
      <td class="actions">
        <input
          class="liters-input"
          type="number"
          step="0.1"
          min="0"
          max="30"
          inputmode="decimal"
          enterkeyhint="done"
          value="${j.currentLiters}"
          aria-label="New liters for ${j.name}"
          data-id="${j.id}"
          data-name="${j.name}"
        />
        <button class="save-btn" data-id="${j.id}">Save</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // meta text, unchanged
  return { below, out, total: juices.length };
}

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

// Mobile-focused interactions: tap Save + blur clamp
export function wireTableInteractions(tbody, { onSaveRequest }) {
  // 1) Tap Save ⇒ PUT ⇒ refetch
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.save-btn');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const row = btn.closest('tr');
    const input = row?.querySelector(`.liters-input[data-id="${id}"]`);
    if (!input) return;

    const liters = normalizeLiters(input.value);
    if (liters == null) {
      showToast('Enter a number between 0 and 30.');
      return;
    }

    await doSave(btn, input, id, liters, onSaveRequest);
  });

  // 2) On leaving the input, clamp within [0, 30]
  tbody.addEventListener('blur', (e) => {
    const input = e.target.closest('.liters-input');
    if (!input) return;
    const liters = clampLiters(input.value);
    if (liters != null) input.value = liters;
  }, true);

  // 3) Admin: Save PAR ⇒ PUT ⇒ refetch
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.save-par-btn');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const row = btn.closest('tr');
    const input = row?.querySelector(`.par-input[data-id="${id}"]`);
    if (!input) return;
    const par = normalizePar(input.value);
    if (par == null) {
      showToast('Enter a PAR between 0 and 10 (0.5 steps).');
      return;
    }
    await doSavePar(btn, input, id, par, onSaveRequest);
  });

  // 4) Clamp PAR on blur to [0,10] and normalize to 0.5 increments
  tbody.addEventListener('blur', (e) => {
    const input = e.target.closest('.par-input');
    if (!input) return;
    const par = clampPar(input.value);
    if (par != null) input.value = par;
  }, true);
}

function normalizeLiters(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 30) return null;
  return n;
}

function clampLiters(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return Math.min(30, Math.max(0, n));
}

async function doSave(btn, input, id, liters, onSaveRequest) {
  if (btn) {
    btn.disabled = true;
    var prev = btn.textContent;
    btn.textContent = 'Saving…';
  }

  try {
    await updateLiters(id, liters);
    showToast(`Updated ${input.dataset.name} to ${liters} L`);
    await onSaveRequest?.(); // controller decides: refetch & rerender
  } catch (err) {
    console.error(err);
    showToast('Update failed');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = prev;
    }
  }
}

function normalizePar(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 10) return null;
  // normalize to 0.5 steps
  return Math.round(n * 2) / 2;
}

function clampPar(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(10, Math.max(0, n));
  return Math.round(clamped * 2) / 2;
}

async function doSavePar(btn, input, id, par, onSaveRequest) {
  if (btn) {
    btn.disabled = true;
    var prev = btn.textContent;
    btn.textContent = 'Saving…';
  }
  try {
    await updatePar(id, par);
    showToast(`Updated PAR for ${input.dataset.name} to ${par} L`);
    await onSaveRequest?.();
  } catch (err) {
    console.error(err);
    showToast('Update failed');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = prev;
    }
  }
}

function showToast(msg) {
  const el = document.getElementById('notify');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.style.display = 'none'; }, 1800);
}
