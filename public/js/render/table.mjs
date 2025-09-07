// public/js/render/table.mjs
import { code3, getStatus, fmtDate, isStale } from '../utils.mjs';
import { LITERS_MIN, LITERS_MAX, LITERS_STEP, PAR_MIN, PAR_MAX, PAR_STEP } from './config.mjs';

export function renderTable(tbody, juices, { isAdmin = false } = {}) {
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  if (!juices || juices.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" class="muted empty">No juices yet</td>`;
    frag.appendChild(tr);
    tbody.appendChild(frag);
    return { below: 0, out: 0, total: 0 };
  }

  let below = 0;
  let out = 0;
  let stale = 0;

  for (const j of juices) {
    const status = getStatus(j);
    if (status === 'BELOW PAR') below++;
    if (status === 'OUT') out++;

    const tr = document.createElement('tr');
    // mark stale rows (>24h since lastUpdated)
    if (isStale(j.lastUpdated)) {
      tr.classList.add('stale');
      stale++;
    }
    tr.innerHTML = rowHTML(j, status, isAdmin);
    frag.appendChild(tr);

    const litersInput = tr.querySelector('.liters-input');
    if (litersInput) litersInput.dataset.original = String(j.currentLiters);

    const parInput = tr.querySelector('.par-input');
    if (parInput) parInput.dataset.original = String(j.parLiters);
  }

  tbody.appendChild(frag);
  return { below, out, total: juices.length, stale };
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
            step="${PAR_STEP}"
            min="${PAR_MIN}"
            max="${PAR_MAX}"
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
        step="${LITERS_STEP}"
        min="${LITERS_MIN}"
        max="${LITERS_MAX}"
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
