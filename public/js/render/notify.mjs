// public/js/render/notify.mjs
let _t;
export function showToast(msg) {
  const el = document.getElementById('notify');
  if (!el) return;
  if (!el.hasAttribute('role')) {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  }
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(_t);
  _t = setTimeout(() => { el.style.display = 'none'; }, 1800);
}
