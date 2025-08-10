// File: utils/inventoryLogic.js

export function createItem(name, quantity = 0, unit) {
  return { name, quantity, unit }
}

export function updateQuantity(item, amount) {
  return { 
    ...item,
    quantity: item.quantity + amount
  };
}