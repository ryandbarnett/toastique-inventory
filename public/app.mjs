// public/app.mjs
import { bindTableDelegation, handleAddItem, refresh } from './tableEvents.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-item-form');
  const container = document.getElementById('inventory');

  bindTableDelegation(container);
  handleAddItem(form, container);
  refresh(container);
});
