// public/js/api.mjs
// API calls (no DOM)
export async function fetchJuices({ sort = 'name', dir = 'asc' } = {}) {
  const q = new URLSearchParams({ sort, dir }).toString();
  const res = await fetch(`/api/juices?${q}`);
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
