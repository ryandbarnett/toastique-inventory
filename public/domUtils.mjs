// public/domUtils.mjs
export function el(tag, { attrs = {}, dataset = {}, text = null } = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k in n) n[k] = v; else n.setAttribute(k, String(v));
  }
  for (const [k, v] of Object.entries(dataset)) {
    if (v == null) continue;
    n.dataset[k] = String(v);
  }
  if (text != null) n.textContent = String(text);
  for (const c of children) n.appendChild(c);
  return n;
}

export function renderError(container, msg) {
  const p = el('p', { attrs: { style: 'color: red;' }, text: msg });
  container.replaceChildren(p);
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}