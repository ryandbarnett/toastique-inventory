// public/renderInventoryTable.mjs
import { el, fmtDate } from './domUtils.mjs';

export function renderItems(items, container) {
  const tbody = container.querySelector('tbody');
  if (!tbody) return;
  const frag = document.createDocumentFragment();

  for (const item of items) {
    const tr = el('tr', { dataset: { id: String(item.id) } });

    const nameStatic = el('span', { attrs: { className: 'static' }, text: String(item.name ?? '') });
    const nameInput  = el('input', { attrs: { className: 'edit hidden', type: 'text', value: String(item.name ?? '') } });

    const qtyStatic = el('span', { attrs: { className: 'static' }, text: String(item.quantity ?? 0) });
    const qtyInput  = el('input', { attrs: { className: 'edit hidden', type: 'number', value: String(item.quantity ?? 0) } });

    const unitStatic = el('span', { attrs: { className: 'static' }, text: String(item.unit ?? '') });
    const unitInput  = el('input', { attrs: { className: 'edit hidden', type: 'text', value: String(item.unit ?? '') } });

    const parStatic = el('span', { attrs: { className: 'static' }, text: String(item.par ?? 0) });
    const parInput  = el('input', { attrs: { className: 'edit hidden', type: 'number', min: 0, step: 'any', value: String(item.par ?? 0) } });

    const lastUpdated = el('span', { attrs: { className: 'static' }, text: fmtDate(item.lastUpdated) });

    const editBtn   = el('button', { dataset: { action: 'edit'   }, text: 'Edit' });
    const saveBtn   = el('button', { attrs: { className: 'hidden' }, dataset: { action: 'save'   }, text: 'Save' });
    const cancelBtn = el('button', { attrs: { className: 'hidden' }, dataset: { action: 'cancel' }, text: 'Cancel' });
    const deleteBtn = el('button', { dataset: { action: 'delete' }, text: 'Delete' });

    // Optional visual hint for low stock (quantity < par). You can style [data-low-stock="1"] in CSS.
    const lowStock = typeof item.quantity === 'number' && typeof item.par === 'number' && item.quantity < item.par;
    if (lowStock) tr.dataset.lowStock = '1';

    tr.append(
      el('td', {}, nameStatic, nameInput),
      el('td', {}, qtyStatic,  qtyInput),
      el('td', {}, unitStatic, unitInput),
      el('td', {}, parStatic,  parInput),
      el('td', {}, lastUpdated),
      el('td', {}, editBtn, saveBtn, cancelBtn, deleteBtn),
    );

    frag.appendChild(tr);
  }

  tbody.replaceChildren(frag);
}

