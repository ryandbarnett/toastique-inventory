// public/app.js

import { makeFrontendController } from './js/controllers.mjs';

document.addEventListener('DOMContentLoaded', () => {
  makeFrontendController().init();
});
