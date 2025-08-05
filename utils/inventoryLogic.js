export function createItem(name, quantity = 0, unit) {
  return { 
    name,
    quantity, 
    unit, 
    lastUpdated: new Date().toISOString() 
  };
}

export function updateQuantity(item, amount) {
  return { 
    ...item,
    quantity: item.quantity + amount,
    lastUpdated: new Date().toISOString()
  };
}