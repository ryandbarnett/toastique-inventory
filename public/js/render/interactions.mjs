// public/js/render/interactions.mjs
import { updateLiters, updatePar } from '../api.mjs';
import { showToast } from './notify.mjs';

export function wireTableInteractions(tbody, { onSaveRequest }) {
  // Click any Save (liters or PAR)
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('save-btn')) {
      const id = toId(btn.dataset.id);
      if (id == null) return;
      const row   = btn.closest('tr');
      const input = row?.querySelector(`.liters-input[data-id="${id}"]`);
      if (!input) return;

      const liters = normalizeLiters(input.value);
      if (liters == null) return void showToast('Enter a number between 0 and 30.');
      if (String(liters) === (input.dataset.original ?? '')) {
        return void showToast('No changes to save');
      }

      await doSaveLiters(btn, input, id, liters, onSaveRequest);
    }

    if (btn.classList.contains('save-par-btn')) {
      const id = toId(btn.dataset.id);
      if (id == null) return;
      const row   = btn.closest('tr');
      const input = row?.querySelector(`.par-input[data-id="${id}"]`);
      if (!input) return;

      const par = normalizePar(input.value);
      if (par == null) return void showToast('Enter a PAR between 0 and 10 (0.5 steps).');
      if (String(par) === (input.dataset.original ?? '')) {
        return void showToast('No changes to save');
      }

      await doSavePar(btn, input, id, par, onSaveRequest);
    }
  });

  // Blur clamp for both inputs (capture)
  tbody.addEventListener('blur', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.classList.contains('liters-input')) {
      const v = clampLiters(target.value);
      if (v != null) target.value = v;
      return;
    }
    if (target.classList.contains('par-input')) {
      const v = clampPar(target.value);
      if (v != null) target.value = v;
    }
  }, true);

  // Enter triggers Save
  tbody.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;

    const id = toId(input.dataset.id);
    if (id == null) return;

    if (input.classList.contains('liters-input')) {
      const btn = input.closest('tr')?.querySelector(`.save-btn[data-id="${id}"]`);
      if (btn) btn.click();
      return;
    }
    if (input.classList.contains('par-input')) {
      const btn = input.closest('tr')?.querySelector(`.save-par-btn[data-id="${id}"]`);
      if (btn) btn.click();
    }
  });
}

/* --- helpers (module-private) --- */

function toId(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
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

function normalizePar(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 10) return null;
  return Math.round(n * 2) / 2; // 0.5 steps
}

function clampPar(raw) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(10, Math.max(0, n));
  return Math.round(clamped * 2) / 2;
}

async function doSaveLiters(btn, input, id, liters, onSaveRequest) {
  const prev = swapSaving(btn, true);
  try {
    await updateLiters(id, liters);
    input.dataset.original = String(liters);
    showToast(`Updated ${input.dataset.name} to ${liters} L`);
    await onSaveRequest?.();
  } catch (err) {
    console.error(err);
    showToast('Update failed');
  } finally {
    swapSaving(btn, false, prev);
  }
}

async function doSavePar(btn, input, id, par, onSaveRequest) {
  const prev = swapSaving(btn, true);
  try {
    await updatePar(id, par);
    input.dataset.original = String(par);
    showToast(`Updated PAR for ${input.dataset.name} to ${par} L`);
    await onSaveRequest?.();
  } catch (err) {
    console.error(err);
    showToast('Update failed');
  } finally {
    swapSaving(btn, false, prev);
  }
}

function swapSaving(btn, saving, prevText = btn?.textContent) {
  if (!btn) return prevText;
  btn.disabled = !!saving;
  btn.textContent = saving ? 'Saving…' : prevText;
  return prevText;
}
