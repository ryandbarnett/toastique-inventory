async function fetchJuices() {
  const res = await fetch('/api/juices')
  if (!res.ok) throw new Error('Failed to load juices')
  return res.json()
}

function computeStatus(j) {
  if (j.currentLiters <= 0) return 'OUT'
  if (j.currentLiters >= j.parLiters) return 'OK'
  return 'BELOW PAR'
}

function fmtDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch {
    return '—'
  }
}

function showToast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.style.display = 'block'
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => { el.style.display = 'none' }, 1800)
}

async function updateLiters(id, liters) {
  const res = await fetch(`/api/juices/${id}/liters`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liters })
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Update failed')
  }
  return res.json()
}

function renderTable(juices) {
  const tb = document.getElementById('tb')
  tb.innerHTML = ''
  let below = 0

  for (const j of juices) {
    const status = computeStatus(j)
    if (status === 'BELOW PAR') below++

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${j.name}</td>
      <td>${j.parLiters}</td>
      <td>${j.currentLiters}</td>
      <td>
        <span class="status ${
          status === 'OK'
            ? 'ok'
            : status === 'OUT'
              ? 'out'
              : 'low'
        }">${status}</span>
      </td>
      <td class="muted">${fmtDate(j.lastUpdated)}</td>
      <td class="actions">
        <input type="number" step="0.1" min="0" max="30" value="${j.currentLiters}" aria-label="New liters for ${j.name}" />
        <button>Save</button>
      </td>
    `

    const input = tr.querySelector('input')
    const btn = tr.querySelector('button')
    btn.addEventListener('click', async () => {
      const value = Number(input.value)
      if (!Number.isFinite(value) || value < 0 || value > 30) {
        showToast('Enter a number between 0 and 30.')
        return
      }
      btn.disabled = true
      btn.textContent = 'Saving…'
      try {
        await updateLiters(j.id, value)
        showToast(`Updated ${j.name} to ${value} L`)
        await init() // re-fetch + re-render
      } catch (e) {
        console.error(e)
        showToast('Update failed')
      } finally {
        btn.disabled = false
        btn.textContent = 'Save'
      }
    })

    tb.appendChild(tr)
  }

  document.getElementById('meta').textContent =
    `${juices.length} juices • ${below} below PAR`
}

async function init() {
  try {
    const juices = await fetchJuices()
    renderTable(juices)
  } catch (e) {
    console.error(e)
    document.getElementById('tb').innerHTML =
      `<tr><td colspan="6">Failed to load.</td></tr>`
  }
}

init()
