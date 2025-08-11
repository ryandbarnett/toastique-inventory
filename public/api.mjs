// public/api.mjs
const j = async (res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export async function getItems() {
  return j(await fetch('/api/items'));
}

export async function patchItem(id, body) {
  return j(await fetch(`/api/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function deleteItem(id) {
  return j(await fetch(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}

export async function createItem(item) {
  return j(await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }));
}
