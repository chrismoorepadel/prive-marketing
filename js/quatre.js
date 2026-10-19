(() => {
  'use strict';
  const form = document.getElementById('project-form');
  if (!form) return;
  const error = document.getElementById('form-error');
  const success = document.getElementById('form-success');
  const button = form.querySelector('button[type="submit"]');
  const client = form.elements.onBehalfOfClient;
  const companyField = document.getElementById('company-field');
  const fields = ['fullName', 'email', 'location', 'projectType', 'support', 'company', 'phone', 'details', 'website'];
  const query = new URLSearchParams(window.location.search);
  const attribution = { landing_page: window.location.pathname, referrer_host: '' };
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    attribution[key] = (query.get(key) || '').slice(0, 200);
  }
  try { attribution.referrer_host = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* Referrer is optional. */ }
  let lastAttempt = null;
  let inFlight = false;
  const buttonLabel = button.innerHTML;

  function uuid() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    error.focus();
  }

  client.addEventListener('change', () => { companyField.hidden = !client.checked; });
  document.querySelectorAll('[data-support], [data-project-type], [data-client-project]').forEach(link => {
    link.addEventListener('click', () => {
      if (link.dataset.support) form.elements.support.value = link.dataset.support;
      if (link.dataset.projectType) form.elements.projectType.value = link.dataset.projectType;
      if (link.hasAttribute('data-client-project')) {
        client.checked = true;
        companyField.hidden = false;
      }
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (inFlight || !form.reportValidity()) return;
    error.hidden = true;
    const data = Object.fromEntries(fields.map(name => [name, form.elements[name].value.trim()]));
    data.onBehalfOfClient = client.checked;
    if (!client.checked) data.company = '';
    data.attribution = attribution;
    const fingerprint = JSON.stringify(data);
    // An uncertain response must retry the exact request with the same ID.
    // Editing the inquiry creates a new request. No personal data is persisted
    // to browser storage or sent to marketing/analytics services.
    try {
      if (!lastAttempt || lastAttempt.fingerprint !== fingerprint) {
        lastAttempt = { fingerprint, payload: JSON.stringify({ ...data, inquiryId: uuid() }) };
      }
    } catch {
      showError('The form could not start. Please email your project details to chris@prive-padel.com.');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 18000);
    inFlight = true;
    button.disabled = true;
    button.textContent = 'Sending your inquiry…';
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/quatre-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: lastAttempt.payload,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.ok !== true) {
        if (response.status === 429) throw new Error('The inquiry service is busy. Please wait a moment and try again, or email chris@prive-padel.com.');
        if (response.status === 400) throw new Error('Please check your project details and try again. You can also email chris@prive-padel.com.');
        throw new Error('We could not confirm your submission. Your details are still here. Please retry, or email chris@prive-padel.com.');
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (err) {
      showError(err.name === 'AbortError' || err instanceof TypeError
        ? 'We could not confirm your submission. Please retry with the details below, or email chris@prive-padel.com.'
        : err.message);
    } finally {
      window.clearTimeout(timer);
      inFlight = false;
      button.disabled = false;
      button.innerHTML = buttonLabel;
      form.removeAttribute('aria-busy');
    }
  });
  form.hidden = false;
})();
