// public/js/api.mjs
// API calls (no DOM)
export async function fetchJuices() {
  const res = await fetch('/api/juices');
  if (!res.ok) throw new Error('Failed to load juices');
  return res.json();
}

export async function updateLiters(id, liters) {
  const res = await fetch(`/api/juices/${id}/liters`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liters }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Update failed');
  }
  return res.json();
}

// --- Auth API ---------------------------------------------------------------

export async function fetchUsers() {
  const res = await fetch('/api/auth/users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me');
  if (res.status === 401) return null; // not logged in
  if (!res.ok) throw new Error('Failed to load session');
  return res.json();
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
