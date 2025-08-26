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
