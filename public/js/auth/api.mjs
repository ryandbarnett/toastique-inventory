// public/js/auth/api.mjs
// --- Auth API ---------------------------------------------------------------
import { get, postJson, request } from '../api/http.mjs';

export function fetchUsers({ signal, timeoutMs } = {}) {
  return get('/api/auth/users', { signal, timeoutMs });
}

export async function fetchMe({ signal, timeoutMs } = {}) {
  const data = await get('/api/auth/me', { signal, timeoutMs });
  const { authenticated, user } = data || {};
  return authenticated ? user : null;
}

export function authBegin(userId, opts = {}) {
  return postJson('/api/auth/begin', { userId }, opts); // { name, needsPinSetup }
}

export function authSetPin(userId, pin, confirm, opts = {}) {
  return postJson('/api/auth/set-pin', { userId, pin, confirm }, opts); // { id, name }
}

export function authLogin(userId, pin, opts = {}) {
  return postJson('/api/auth/login', { userId, pin }, opts); // { id, name }
}

export function authLogout(opts = {}) {
  // Some backends return 204; use low-level request for flexibility
  return request('/api/auth/logout', { method: 'POST', ...opts });
}
