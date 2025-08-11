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

// --- Non-blocking status banners (error/success/info) ---
export function showBanner(container, message, { variant = 'error', timeout = 4000 } = {}) {
  // Put banners right above the inventory table/form container
  const host = container.closest('#inventory') || container;
  let area = document.querySelector('[data-ui="status-area"]');
  if (!area) {
    area = document.createElement('div');
    area.dataset.ui = 'status-area';
    area.setAttribute('aria-live', 'polite');
    area.style.margin = '0 0 0.5rem 0';
    // insert before the table container if possible
    host.parentElement?.insertBefore(area, host);
  }

  const banner = document.createElement('div');
  banner.dataset.ui = 'status-banner';
  banner.textContent = String(message);
  // minimal inline styles; swap for classes if you prefer
  banner.style.padding = '8px 12px';
  banner.style.borderRadius = '8px';
  banner.style.fontSize = '0.95rem';
  banner.style.marginBottom = '6px';
  banner.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
  banner.style.border = '1px solid';

  if (variant === 'success') {
    banner.style.background = '#f0fff4';
    banner.style.color = '#046d36';
    banner.style.borderColor = '#9ae6b4';
  } else if (variant === 'info') {
    banner.style.background = '#eff6ff';
    banner.style.color = '#1e40af';
    banner.style.borderColor = '#93c5fd';
  } else { // error (default)
    banner.style.background = '#fff5f5';
    banner.style.color = '#9b1c1c';
    banner.style.borderColor = '#feb2b2';
  }

  area.appendChild(banner);
  if (timeout) {
    setTimeout(() => banner.remove(), timeout);
  }
}