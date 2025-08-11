// public/tableEvents.mjs
import { getItems, patchItem, deleteItem, createItem } from './api.mjs';
import { renderItems } from './renderInventoryTable.mjs';
import { showBanner } from './domUtils.mjs';

async function refresh(container) {
  try {
    const items = await getItems();
    renderItems(items, container);
  } catch (err) {
    console.error('Refresh failed:', err);
    showBanner(container, 'Failed to refresh inventory. Please try again.', { variant: 'error' });
  }
}

export function bindTableDelegation(container) {
  const tbody = container.querySelector('tbody');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn || !tbody.contains(btn)) return;

    const action = btn.dataset.action;
    const tr = btn.closest('tr');
    const id = tr?.dataset?.id;
    if (!id) return;

    const inputs = tr.querySelectorAll('input.edit');
    const statics = tr.querySelectorAll('span.static');
    const [nameInput, qtyInput, unitInput] = inputs;

    const toggleEdit = (editing) => {
      inputs.forEach(i => i.classList.toggle('hidden', !editing));
      statics.forEach(s => s.classList.toggle('hidden', editing));
      tr.querySelector('[data-action="edit"]').classList.toggle('hidden', editing);
      tr.querySelector('[data-action="save"]').classList.toggle('hidden', !editing);
      tr.querySelector('[data-action="cancel"]').classList.toggle('hidden', !editing);
    };

    try {
      if (action === 'edit') {
        toggleEdit(true);
        nameInput?.focus();
        return;
      }
      if (action === 'cancel') {
        const [nameStatic, qtyStatic, unitStatic] = statics;
        if (nameInput && nameStatic) nameInput.value = nameStatic.textContent ?? '';
        if (qtyInput && qtyStatic) qtyInput.value = qtyStatic.textContent ?? '';
        if (unitInput && unitStatic) unitInput.value = unitStatic.textContent ?? '';
        toggleEdit(false);
        return;
      }
      if (action === 'save') {
        await patchItem(id, {
          name: nameInput?.value ?? '',
          quantity: Number(qtyInput?.value ?? 0),
          unit: unitInput?.value ?? ''
        });
        await refresh(container);
        showBanner(container, 'Item updated.', { variant: 'success', timeout: 2500 });
        return;
      }
      if (action === 'delete') {
        const nameText = tr.querySelector('td:first-child .static')?.textContent ?? 'this item';
        if (!confirm(`Delete "${nameText}" from inventory?`)) return;
        await deleteItem(id);
        await refresh(container);
        showBanner(container, 'Item deleted.', { variant: 'success', timeout: 2500 });
        return;
      }
    } catch (err) {
      console.error(`Action "${action}" failed for id=${id}:`, err);
      const msg = err instanceof Error ? err.message : `Failed to ${action} item.`;
      showBanner(container, msg, { variant: 'error' });
    }
  });
}

export function handleAddItem(form, container) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value;
    const quantity = Number(form.querySelector('#quantity').value);
    const unit = form.querySelector('#unit').value;

    try {
      await createItem({ name, quantity, unit });
      await refresh(container);
      form.reset();
      showBanner(container, 'Item added.', { variant: 'success', timeout: 2500 });
    } catch (err) {
      console.error('Error adding item:', err);
      const msg = err instanceof Error ? err.message : 'Failed to add item.';
      showBanner(container, msg, { variant: 'error' });
    }
  });
}

export { refresh };
