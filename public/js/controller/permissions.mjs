// public/js/controller/permissions.mjs
export function setEditEnabled(tbody, enabled) {
  if (!tbody) return;
  tbody.querySelectorAll('.liters-input').forEach(i => { i.disabled = !enabled; });
  tbody.querySelectorAll('.save-btn').forEach(b => { b.disabled = !enabled; });
}

export function applyAdminGates(tbody, isAdmin) {
  if (!tbody) return;
  tbody.querySelectorAll('.par-input, .save-par-btn').forEach(el => {
    el.disabled = !isAdmin;
  });
}
