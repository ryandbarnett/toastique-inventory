// public/app.js

// --- Fetch & helpers ---
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

function getStatus(j) {
  return j.status ?? computeStatus(j)
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
  const el = document.getElementById('notify')
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

// Add near the top with your other helpers
function code3(name) {
  // Take first 3 alphabetic characters; uppercase
  const letters = name.replace(/[^A-Za-z]/g, '')
  return letters.slice(0, 3).toUpperCase()
}

// --- Sorting state ---
let juicesCache = []
let sortMode = 'name'
let sortDir = 'asc'

const STATUS_ORDER = { OUT: 0, 'BELOW PAR': 1, OK: 2 }

function sortJuices(list) {
  const arr = [...list]
  if (sortMode === 'name') {
    arr.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortMode === 'status') {
    arr.sort((a, b) => {
      const sa = STATUS_ORDER[getStatus(a)] ?? 99
      const sb = STATUS_ORDER[getStatus(b)] ?? 99
      if (sa !== sb) return sa - sb
      return a.name.localeCompare(b.name)
    })
  }
  if (sortDir === 'desc') arr.reverse()
  return arr
}

function bindSortClicks() {
  const headers = document.querySelectorAll('th[data-sort]')
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const mode = th.getAttribute('data-sort')
      if (sortMode === mode) {
        // toggle direction if clicking same column
        sortDir = sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        sortMode = mode
        sortDir = 'asc'
      }

      // update classes for arrow icons
      headers.forEach(h => h.classList.remove('active', 'desc'))
      th.classList.add('active')
      if (sortDir === 'desc') th.classList.add('desc')

      renderTable(juicesCache)
    })
  })
}

function setSortHeaderState() {
  const headers = document.querySelectorAll('th[data-sort]')
  headers.forEach(h => h.classList.remove('active', 'desc'))
  const th = document.querySelector(`th[data-sort="${sortMode}"]`)
  if (th) {
    th.classList.add('active')
    if (sortDir === 'desc') th.classList.add('desc')
  }
}

// --- Render ---
function renderTable(juices) {
  const tb = document.getElementById('tb')
  tb.innerHTML = ''

  let below = 0
  let out = 0

  const list = sortJuices(juices)

  for (const j of list) {
    const status = getStatus(j)
    if (status === 'BELOW PAR') below++
    if (status === 'OUT') out++

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="name-col">
        <span class="name-code"><abbr title="${j.name}">${code3(j.name)}</abbr></span>
        <span class="name-full">${j.name}</span>
      </td>
      <td>${j.parLiters}</td>
      <td>${j.currentLiters}</td>
      <td>
        <span class="status ${
          status === 'OK' ? 'ok' : status === 'OUT' ? 'out' : 'low'
        }">${status}</span>
      </td>
      <td class="muted">${fmtDate(j.lastUpdated)}</td>
      <td class="actions">
        <input type="number" step="0.1" min="0" max="30" inputmode="decimal" enterkeyhint="done"
          value="${j.currentLiters}"
          aria-label="New liters for ${j.name}" />
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
        // Refresh data so status/lastUpdated are current
        const refreshed = await fetchJuices()
        juicesCache = refreshed
        renderTable(juicesCache)
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
    `${juices.length} juices • ${below} below PAR • ${out} out`
}

// --- Init ---
async function init() {
  try {
    const juices = await fetchJuices()
    juicesCache = juices
    renderTable(juicesCache)
    bindSortClicks()
    setSortHeaderState()
  } catch (e) {
    console.error(e)
    document.getElementById('tb').innerHTML =
      `<tr><td colspan="6">Failed to load.</td></tr>`
  }
}

init()
