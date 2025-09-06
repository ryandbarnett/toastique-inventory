// public/js/render/table.mjs
import { code3, getStatus, fmtDate } from '../utils.mjs';

export function renderTable(tbody, juices, { isAdmin = false } = {}) {
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  let below = 0;
  let out = 0;

  for (const j of juices) {
    const status = getStatus(j);
    if (status === 'BELOW PAR') below++;
    if (status === 'OUT') out++;

    const tr = document.createElement('tr');
    tr.innerHTML = rowHTML(j, status, isAdmin);
    frag.appendChild(tr);

    const litersInput = tr.querySelector('.liters-input');
    if (litersInput) litersInput.dataset.original = String(j.currentLiters);

    const parInput = tr.querySelector('.par-input');
    if (parInput) parInput.dataset.original = String(j.parLiters);
  }

  tbody.appendChild(frag);
  return { below, out, total: juices.length };
}

function rowHTML(j, status, isAdmin) {
  const statusClass = status === 'OK' ? 'ok' : status === 'OUT' ? 'out' : 'low';
  const shortAttr = status === 'BELOW PAR' ? 'data-short="LOW"' : '';
  return `
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
}
