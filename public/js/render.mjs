// Rendering + delegated events (DOM only)
import { code3, getStatus, STATUS_ORDER, fmtDate } from './utils.mjs';
import { updateLiters } from './api.mjs';

export function renderTable(tbody, juices, { sortMode, sortDir }) {
  tbody.innerHTML = '';

  // sorting (same behavior as before)
  const list = sortJuices(juices, sortMode, sortDir);

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
      <td>${j.parLiters}</td>
      <td>${j.currentLiters}</td>
      <td>
        <span class="status ${statusClass}" ${shortAttr}>${status}</span>
      </td>
      <td class="muted">${fmtDate(j.lastUpdated)}</td>
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

export function wireSaves(tbody, { onSaveRequest }) {
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.save-btn');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const row = btn.closest('tr');
    const input = row?.querySelector(`.liters-input[data-id="${id}"]`);
    if (!input) return;

    const liters = Number(input.value);
    if (!Number.isFinite(liters) || liters < 0 || liters > 30) {
      showToast('Enter a number between 0 and 30.');
      return;
    }

    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = 'Saving…';
    try {
      await updateLiters(id, liters);
      showToast(`Updated ${input.dataset.name} to ${liters} L`);
      await onSaveRequest(); // controller decides: refetch & rerender
    } catch (err) {
      console.error(err);
      showToast('Update failed');
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });
}

function sortJuices(list, sortMode, sortDir) {
  const arr = [...list];
  if (sortMode === 'name') {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === 'status') {
    arr.sort((a, b) => {
      const sa = STATUS_ORDER[getStatus(a)] ?? 99;
      const sb = STATUS_ORDER[getStatus(b)] ?? 99;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    });
  }
  if (sortDir === 'desc') arr.reverse();
  return arr;
}

function showToast(msg) {
  const el = document.getElementById('notify');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.style.display = 'none'; }, 1800);
}
