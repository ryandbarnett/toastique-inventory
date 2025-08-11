// public/itemView.mjs
import { el } from './domUtils.mjs';

export function createItemElement(item) {
  return el('div', { text: `${item.name} - ${item.quantity} ${item.unit}` });
}
