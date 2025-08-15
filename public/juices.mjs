// public/juices.mjs
import { el, showBanner } from './domUtils.mjs'

const table = document.getElementById('juices')
const tbody = table.querySelector('tbody')
const statusEl = document.getElementById('status')

const j = async (res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

const getJuices = async () => j(await fetch('/api/juices'))

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function render(rows) {
  const frag = document.createDocumentFragment()

  rows.forEach(jc => {
    const tr = document.createElement('tr')

    // Visual alert if not counted yet or below PAR
    if (jc.countLiters === null || jc.belowPar) {
      tr.classList.add('alert')
    }

    const statusBadge =
      jc.countLiters === null
        ? el('span', { attrs: { className: 'badge warn' }, text: 'Not counted yet' })
        : (jc.belowPar
            ? el('span', { attrs: { className: 'badge warn' }, text: 'Below PAR' })
            : el('span', { attrs: { className: 'badge ok' }, text: 'OK' }))

    tr.append(
      el('td', { text: jc.name }),
      el('td', { text: String(jc.parLiters) }),
      el('td', { text: jc.countLiters == null ? '' : String(jc.countLiters) }),
      el('td', { text: fmtTime(jc.countedAt) }),
      el('td', {}, statusBadge)
    )

    frag.appendChild(tr)
  })

  tbody.replaceChildren(frag)
}

async function load() {
  try {
    statusEl.textContent = 'Loading…'
    const data = await getJuices()
    render(data)
    statusEl.textContent = 'Up to date'
    statusEl.classList.remove('warn')
  } catch (err) {
    console.error(err)
    statusEl.textContent = 'Failed to load'
    statusEl.classList.add('warn')
    const msg = err instanceof Error ? err.message : 'Unknown error'
    showBanner(table, `Failed to load juices: ${msg}`, { variant: 'error' })
  }
}

load()
