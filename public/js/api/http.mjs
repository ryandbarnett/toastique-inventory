// public/js/api/http.mjs

/**
 * Merge an external AbortSignal with a local timeout.
 * If either aborts, the combined signal aborts.
 */
function withTimeoutSignal(signal, timeoutMs) {
  if (!timeoutMs) return { signal };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  if (signal) {
    if (signal.aborted) ctrl.abort(signal.reason);
    else signal.addEventListener('abort', () => ctrl.abort(signal.reason), { once: true });
  }

  return {
    signal: ctrl.signal,
    cleanup: () => clearTimeout(t),
  };
}

async function readBodySafe(res) {
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  try {
    return isJson ? await res.json() : await res.text();
  } catch {
    return null;
  }
}

/**
 * Low-level fetch wrapper.
 * - credentials: 'include' by default (session cookies)
 * - JSON/text response handled gracefully
 * - throws Error with status + message on !ok
 */
export async function request(path, {
  method = 'GET',
  headers,
  body,
  signal,
  timeoutMs = 10000, // 10s default
  credentials = 'include',
} = {}) {
  const { signal: combinedSignal, cleanup } = withTimeoutSignal(signal, timeoutMs);
  try {
    const res = await fetch(path, { method, headers, body, credentials, signal: combinedSignal });
    if (!res.ok) {
      const payload = await readBodySafe(res);
      const msg = payload && typeof payload === 'object' && payload.message
        ? payload.message
        : (typeof payload === 'string' && payload) || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return readBodySafe(res);
  } finally {
    cleanup?.();
  }
}

export function qs(params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export function get(path, { query, ...opts } = {}) {
  return request(`${path}${qs(query)}`, { ...opts, method: 'GET' });
}

export function putJson(path, data, opts = {}) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(data ?? {}),
    ...opts,
  });
}

export function postJson(path, data, opts = {}) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(data ?? {}),
    ...opts,
  });
}
