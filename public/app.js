// public/app.js

const QT_PER_L = 1 / 0.946352946; // 1 L = 1.05668821 qt
const fmtQty = (liters) => {
  if (liters == null || Number.isNaN(Number(liters))) return '—'
  const qt = Number(liters) * QT_PER_L
  return `${qt.toFixed(2)} qt (${Number(liters).toFixed(2)} L)`
}

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  }).format(new Date(iso))
const fmtDateTime = (iso) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
const daysLeft = (iso) => Math.max(0, Math.ceil((new Date(iso) - Date.now()) / 86400000))

const juiceSelect = document.getElementById('juiceSelect')
const createBatchBtn = document.getElementById('createBatchBtn')
const juicesTbody = document.querySelector('#juicesTable tbody')
const batchesTbody = document.querySelector('#batchesTable tbody')
const batchesEmpty = document.getElementById('batchesEmpty')
const batchMultiple = document.getElementById('batchMultiple')
const batchCalc = document.getElementById('batchCalc')
const shiftSelect = document.getElementById('shiftSelect')
const checkLiters = document.getElementById('checkLiters')
const recordCheckBtn = document.getElementById('recordCheckBtn')

if (recordCheckBtn) {
  recordCheckBtn.addEventListener('click', async () => {
    const juice_name = juiceSelect.value
    const liters = Number(checkLiters.value || 'NaN')
    const shift = shiftSelect.value
    if (!Number.isFinite(liters) || liters < 0) {
      alert('Enter a non-negative liters value (e.g., 5.0)')
      return
    }
    try {
      await fetchJSON('/api/juice-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ juice_name, liters, shift })
      })
      checkLiters.value = ''
      // Refresh the juices table to show latest check + status
      await loadJuices()
    } catch (e) {
      alert(`Record failed: ${e.message}`)
    }
  })
}

let juicesCache = []
const juicesByName = new Map()

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

// ---- Juices ----
async function loadJuices() {
  const juices = await fetchJSON('/api/juices/with-latest-check')
  juicesCache = juices
  juicesByName.clear()
  juices.forEach(j => juicesByName.set(j.name, j))

  // select
  juiceSelect.innerHTML = juices
    .map(j => `<option value="${j.name}">${j.name}</option>`)
    .join('')

  // table
  juicesTbody.innerHTML = juices.map(j => {
    const latest = j.latest_check
    const latestTxt = latest
      ? `${Number(latest.liters).toFixed(2)} L (${latest.shift} @ ${fmtDateTime(latest.checked_at)})`
      : '—'

    const statusClass =
      j.latest_status === 'BELOW PAR' ? 'badge badge-warn' :
      j.latest_status === 'OK'        ? 'badge badge-ok'   :
                                        'badge badge-unknown'

    return `
      <tr data-juice="${j.name}">
        <td>${j.name}</td>
        <td>${j.default_batch_liters == null ? '—' : fmtQty(j.default_batch_liters)}</td>
        <td>${j.par_liters == null ? '—' : fmtQty(j.par_liters)}</td>
        <td>${j.expiry_days}</td>
        <td>${latestTxt}</td>
        <td><span class="${statusClass}">${j.latest_status}</span></td>
      </tr>
    `
  }).join('')



  updateBatchHint()
}

// ---- Batches ----
async function loadBatches() {
  const batches = await fetchJSON('/api/juice-batches')

  if (!batches.length) {
    batchesEmpty.textContent = 'No active batches yet.'
  } else {
    batchesEmpty.textContent = ''
  }

  batchesTbody.innerHTML = batches.map(b => {
    const dLeft = daysLeft(b.expires_at)
    const expSoon = dLeft <= 2 ? 'badge badge-warn' : 'badge'
    return `
      <tr data-id="${b.id}">
        <td>${b.juice_name}</td>
        <td>${fmtDate(b.made_at)}</td>
        <td>${fmtDate(b.expires_at)}</td>
        <td><span class="${expSoon}">${dLeft}d</span></td>
        <td>${fmtQty(b.remaining_liters)}</td>
        <td>
          <input type="number" step="0.1" min="0.1" placeholder="0.5" class="pourInput">
        </td>
        <td>
          <button class="pourBtn">Pour</button>
        </td>
      </tr>
    `
  }).join('')
}

function updateBatchHint() {
  const name = juiceSelect.value
  const j = juicesByName.get(name)
  if (!j) return

  // No default size? Disable multiples flow.
  if (j.default_batch_liters == null) {
    batchMultiple.disabled = true
    createBatchBtn.disabled = true
    batchCalc.textContent = 'No default size set for this juice (multiples disabled).'
    return
  }

  batchMultiple.disabled = false
  createBatchBtn.disabled = false

  const mStr = (batchMultiple.value || '').trim()
  const m = mStr === '' ? 1 : Number(mStr)

  if (!Number.isFinite(m) || m <= 0) {
    batchCalc.textContent = `Default: ${fmtQty(j.default_batch_liters)} — enter × multiple (e.g., 1.5)`
    return
  }

  const liters = j.default_batch_liters * m
  const qt = liters * QT_PER_L
  batchCalc.textContent = `${m.toFixed(2)}× = ${qt.toFixed(2)} qt (${liters.toFixed(2)} L) — Default: ${fmtQty(j.default_batch_liters)}`
}


// ---- Actions ----
createBatchBtn.addEventListener('click', async () => {
  const juice_name = juiceSelect.value
  const j = juicesByName.get(juice_name)
  if (!j) return alert('Pick a juice.')

  if (j.default_batch_liters == null) {
    alert('This juice has no default size set; cannot create by multiples.')
    return
  }

  const mStr = (batchMultiple.value || '').trim()
  // Blank or "1" → let server use default size
  const useDefault = (mStr === '' || Number(mStr) === 1)

  const body = { juice_name }
  if (!useDefault) {
    const m = Number(mStr)
    if (!Number.isFinite(m) || m <= 0) {
      alert('Enter a positive multiple (e.g., 1.5)')
      return
    }
    body.volume_liters = j.default_batch_liters * m
  }

  try {
    await fetchJSON('/api/juice-batches', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    batchMultiple.value = ''
    updateBatchHint()
    await loadBatches()
  } catch (e) {
    alert(`Create failed: ${e.message}`)
  }
})


batchesTbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('.pourBtn')
  if (!btn) return

  const tr = btn.closest('tr')
  const id = Number(tr.dataset.id)
  const input = tr.querySelector('.pourInput')
  const liters = Number(input.value || '0')

  if (!Number.isFinite(liters) || liters <= 0) {
    alert('Enter liters to pour (e.g., 0.5)')
    return
  }

  try {
    await fetchJSON('/api/juice-pour', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ batch_id: id, liters })
    })
    await loadBatches()
  } catch (e) {
    alert(`Pour failed: ${e.message}`)
  }
})

juiceSelect.addEventListener('change', updateBatchHint)
batchMultiple.addEventListener('input', updateBatchHint)

// ---- Init ----
await loadJuices()
await loadBatches()
