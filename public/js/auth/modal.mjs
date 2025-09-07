// public/js/auth/modal.mjs
// Small, reusable auth modal helper

export function createAuthModal() {
  const wrapper = document.createElement('div');
  wrapper.className = '__modal';
  wrapper.innerHTML = `
    <div class="__backdrop"></div>
    <div class="__content" role="dialog" aria-modal="true">
      <div class="__panel">
        <div class="_body"></div>
      </div>
    </div>
  `;

  const onBackdrop = () => close();
  wrapper.querySelector('.__backdrop')?.addEventListener('click', onBackdrop);
  const onEsc = (e) => { if (e.key === 'Escape') close(); };
  wrapper.addEventListener('keydown', onEsc);

  document.body.appendChild(wrapper);
  const body = wrapper.querySelector('._body');

  function replaceBody(el) {
    body.innerHTML = '';
    body.appendChild(el);
  }

  function mountUserPicker(users, onPick) {
    const root = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = 'Select your name';
    root.appendChild(h3);

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';

    users.forEach(u => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = u.name;
      btn.style.display = 'block';
      btn.style.margin = '6px 0';
      btn.addEventListener('click', () => onPick?.(u));
      li.appendChild(btn);
      ul.appendChild(li);
    });

    root.appendChild(ul);
    replaceBody(root);
    // focus first option for keyboard users
    ul.querySelector('button')?.focus();
  }

  function mountPinForm({ name, needsPinSetup }, onSubmit, onCancel) {
    const root = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = `Hi, ${name}`;
    root.appendChild(h3);

    const form = document.createElement('form');
    form.innerHTML = `
      <label style="display:block;margin:8px 0;">
        Enter 4-digit PIN
        <input required maxlength="4" inputmode="numeric" pattern="\\d{4}" class="_pin" />
      </label>
      ${needsPinSetup ? `
      <label style="display:block;margin:8px 0;">
        Confirm PIN
        <input required maxlength="4" inputmode="numeric" pattern="\\d{4}" class="_confirm" />
      </label>` : ''}
      <div style="margin-top:10px;">
        <button type="submit">${needsPinSetup ? 'Set PIN & Login' : 'Login'}</button>
        <button type="button" class="_cancel">Cancel</button>
      </div>
    `;
    root.appendChild(form);

    form.querySelector('._cancel')?.addEventListener('click', () => {
      onCancel?.();
      close();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form._busy) return;

      const pin = form.querySelector('._pin')?.value?.trim();
      const confirm = form.querySelector('._confirm')?.value?.trim();
      const submitBtn = form.querySelector('button[type="submit"]');
      const prev = submitBtn?.textContent;

      form._busy = true;
      if (submitBtn) { submitBtn.textContent = 'Working…'; submitBtn.disabled = true; }

      try {
        await onSubmit?.({ pin, confirm, needsPinSetup });
      } finally {
        form._busy = false;
        if (submitBtn && prev) { submitBtn.textContent = prev; submitBtn.disabled = false; }
      }
    });

    replaceBody(root);
    form.querySelector('._pin')?.focus();
  }

  function close() {
    wrapper.removeEventListener('keydown', onEsc);
    wrapper.querySelector('.__backdrop')?.removeEventListener('click', onBackdrop);
    wrapper.remove();
  }

  return { mountUserPicker, mountPinForm, close };
}
