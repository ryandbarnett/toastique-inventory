// public/js/auth/api.mjs
// --- Auth API ---------------------------------------------------------------

export async function fetchUsers() {
  const res = await fetch('/api/auth/users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to load session');
  const { authenticated, user } = await res.json();
  return authenticated ? user : null;
}

export async function authBegin(userId) {
  const res = await fetch('/api/auth/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to begin auth');
  return res.json(); // { name, needsPinSetup }
}

export async function authSetPin(userId, pin, confirm) {
  const res = await fetch('/api/auth/set-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pin, confirm }),
  });
  if (!res.ok) throw new Error('Failed to set PIN');
  return res.json(); // { id, name }
}

export async function authLogin(userId, pin) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pin }),
  });
  if (!res.ok) throw new Error('Failed to login');
  return res.json(); // { id, name }
}

export async function authLogout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!(res.ok || res.status === 204)) throw new Error('Failed to logout');
}