// File: public/app.js

export function createItemElement(item) {
  const div = document.createElement('div')
  div.textContent = `${item.name} - ${item.quantity} ${item.unit}`
  return div
}

export function fetchInventory() {
  fetch('/api/items')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch inventory')
      return res.json()
    })
    .then(items => {
      const container = document.getElementById('inventory')
      renderItems(items, container)
    })
    .catch(err => {
      console.error('Error loading inventory:', err)
      const container = document.getElementById('inventory')
      container.innerHTML = `<p style="color: red;">Failed to load inventory</p>`
    })
}

export function renderItems(items, container) {
  const tbody = container.querySelector('tbody')
  if (!tbody) return

  tbody.innerHTML = ''

  items.forEach(item => {
    const row = document.createElement('tr')

    // Create static row content
    row.innerHTML = `
      <td><span class="static">${item.name}</span><input class="edit hidden" type="text" value="${item.name}" /></td>
      <td><span class="static">${item.quantity}</span><input class="edit hidden" type="number" value="${item.quantity}" /></td>
      <td><span class="static">${item.unit}</span><input class="edit hidden" type="text" value="${item.unit}" /></td>
      <td><span class="static">${new Date(item.lastUpdated).toLocaleString()}</span></td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="save-btn hidden">Save</button>
        <button class="cancel-btn hidden">Cancel</button>
        <button class="delete-btn">Delete</button>
      </td>
    `

    const editBtn = row.querySelector('.edit-btn')
    const saveBtn = row.querySelector('.save-btn')
    const cancelBtn = row.querySelector('.cancel-btn')
    const deleteBtn = row.querySelector('.delete-btn')

    const inputs = row.querySelectorAll('.edit')
    const statics = row.querySelectorAll('.static')

    // 🔄 Toggle edit mode
    function toggleEditMode(editing) {
      inputs.forEach(input => input.classList.toggle('hidden', !editing))
      statics.forEach(span => span.classList.toggle('hidden', editing))
      editBtn.classList.toggle('hidden', editing)
      saveBtn.classList.toggle('hidden', !editing)
      cancelBtn.classList.toggle('hidden', !editing)
    }

    editBtn.addEventListener('click', () => {
      toggleEditMode(true)
    })

    cancelBtn.addEventListener('click', () => {
      toggleEditMode(false)
    })

    saveBtn.addEventListener('click', async () => {
      const updatedItem = {
        name: inputs[0].value,
        quantity: Number(inputs[1].value),
        unit: inputs[2].value
      }

      try {
        const res = await fetch(`/api/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        })

        if (!res.ok) throw new Error('Failed to update item')
        fetchInventory()
      } catch (err) {
        console.error('Error updating item:', err)
        alert('Failed to update item.')
      }
    })

    deleteBtn.addEventListener('click', async () => {
      const confirmed = confirm(`Delete "${item.name}" from inventory?`)
      if (!confirmed) return

      try {
        const res = await fetch(`/api/items/${item.id}`, {
          method: 'DELETE'
        })

        if (!res.ok) throw new Error('Failed to delete item')
        fetchInventory()
      } catch (err) {
        console.error('Error deleting item:', err)
        alert('Failed to delete item.')
      }
    })

    tbody.appendChild(row)
  })
}

export function handleAddItem(form, container) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = form.querySelector('#name').value
    const quantity = Number(form.querySelector('#quantity').value)
    const unit = form.querySelector('#unit').value

    const item = { name, quantity, unit }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!res.ok) throw new Error('Failed to add item')

      fetchInventory()
      form.reset()
    } catch (err) {
      console.error('Error adding item:', err)
      alert('Failed to add item.')
    }
  })
}

// 👉 Boot it up on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory()

  const form = document.getElementById('add-item-form')
  const container = document.getElementById('inventory')
  handleAddItem(form, container)
})