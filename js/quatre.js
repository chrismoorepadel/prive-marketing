(() => {
  'use strict';
  const form = document.getElementById('project-form');
  if (!form) return;
  const error = document.getElementById('form-error');
  const success = document.getElementById('form-success');
  const button = form.querySelector('button[type="submit"]');
  const client = form.elements.onBehalfOfClient;
  const companyField = document.getElementById('company-field');
  const projectStep = document.getElementById('form-step-project');
  const contactStep = document.getElementById('form-step-contact');
  const nextButton = document.getElementById('form-next');
  const backButton = document.getElementById('form-back');
  const stepLabel = document.getElementById('form-step-label');
  const indicators = document.querySelectorAll('#form-progress [data-step-indicator]');
  const mobileCTA = document.getElementById('mobile-project-cta');
  const project = document.getElementById('project');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fields = ['fullName', 'email', 'location', 'projectType', 'support', 'company', 'phone', 'details', 'website'];
  const query = new URLSearchParams(window.location.search);
  const attribution = { landing_page: window.location.pathname, referrer_host: '' };
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    attribution[key] = (query.get(key) || '').slice(0, 200);
  }
  try { attribution.referrer_host = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* Referrer is optional. */ }
  let lastAttempt = null;
  let inFlight = false;
  let currentStep = 1;
  const buttonLabel = button.innerHTML;

  // Hidden required fields must not block the first step's Continue action.
  // Each step is validated explicitly; submission still checks every field.
  form.noValidate = true;
  if (!form.elements.support.value) form.elements.support.value = 'full_service';

  function syncMobileCTA() {
    if (!mobileCTA || !project) return;
    const bounds = project.getBoundingClientRect();
    mobileCTA.hidden = !success.hidden || (bounds.bottom > 0 && bounds.top < window.innerHeight);
  }

  function focusControl(control) {
    if (!control) return;
    control.focus({ preventScroll: true });
    const bounds = control.getBoundingClientRect();
    if (bounds.top < 88 || bounds.bottom > window.innerHeight - 20) {
      control.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }

  function showStep(step, { focus = true } = {}) {
    currentStep = step;
    projectStep.hidden = step !== 1;
    contactStep.hidden = step !== 2;
    form.dataset.step = String(step);
    stepLabel.textContent = step === 1 ? 'Step 1 of 2 · Your project' : 'Step 2 of 2 · Your details';
    indicators.forEach(indicator => {
      const number = Number(indicator.dataset.stepIndicator);
      indicator.dataset.state = number === step ? 'current' : number < step ? 'complete' : 'upcoming';
      if (number === step) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });
    if (focus) {
      const section = step === 1 ? projectStep : contactStep;
      focusControl(section.querySelector('input:not([type="hidden"]), select, textarea'));
    }
    syncMobileCTA();
  }

  function firstInvalid(container) {
    return Array.from(container.querySelectorAll('input, select, textarea'))
      .find(control => {
        if (!control.willValidate) return false;
        // The API trims required text, so whitespace cannot count as a value.
        if (control.required && !control.value.trim()) control.value = '';
        return !control.validity.valid;
      });
  }

  function reportInvalid(control) {
    showStep(projectStep.contains(control) ? 1 : 2, { focus: false });
    focusControl(control);
    control.reportValidity();
  }

  function advance() {
    if (inFlight) return;
    const invalid = firstInvalid(projectStep);
    if (invalid) return reportInvalid(invalid);
    error.hidden = true;
    showStep(2);
  }

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
    focusControl(error);
  }

  nextButton.addEventListener('click', advance);
  backButton.addEventListener('click', () => {
    if (!inFlight) showStep(1);
  });
  projectStep.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      advance();
    }
  });
  client.addEventListener('change', () => { companyField.hidden = !client.checked; });
  companyField.hidden = !client.checked;
  document.querySelectorAll('[data-support], [data-project-type], [data-client-project]').forEach(link => {
    link.addEventListener('click', () => {
      if (inFlight || !success.hidden) return;
      if (link.dataset.support) form.elements.support.value = link.dataset.support;
      if (link.dataset.projectType) form.elements.projectType.value = link.dataset.projectType;
      if (link.hasAttribute('data-client-project')) {
        client.checked = true;
        companyField.hidden = false;
      }
      showStep(1, { focus: false });
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (inFlight) return;
    // Enter on the first step advances the form; it never sends an inquiry.
    if (currentStep === 1) return advance();
    const invalid = firstInvalid(form);
    if (invalid) return reportInvalid(invalid);
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
      showError('The form could not start. Please use the email link on this page to contact our team.');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 18000);
    inFlight = true;
    button.disabled = true;
    nextButton.disabled = true;
    backButton.disabled = true;
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
        if (response.status === 429) throw new Error('The inquiry service is busy. Please wait a moment and try again, or contact our team using the email link on this page.');
        if (response.status === 400) throw new Error('Please check your project details and try again. You can also contact our team using the email link on this page.');
        throw new Error('We could not confirm your submission. Your details are still here. Please retry, or contact our team using the email link on this page.');
      }
      form.hidden = true;
      success.hidden = false;
      syncMobileCTA();
      focusControl(success);
    } catch (err) {
      showError(err.name === 'AbortError' || err instanceof TypeError
        ? 'We could not confirm your submission. Please retry with your existing details, or contact our team using the email link on this page.'
        : err.message);
    } finally {
      window.clearTimeout(timer);
      inFlight = false;
      button.disabled = false;
      nextButton.disabled = false;
      backButton.disabled = false;
      button.innerHTML = buttonLabel;
      form.removeAttribute('aria-busy');
    }
  });
  showStep(1, { focus: false });
  form.hidden = false;
  syncMobileCTA();
  if (mobileCTA && project) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(syncMobileCTA, { threshold: 0 });
      observer.observe(project);
    } else {
      // Keep the form unobscured in browsers without IntersectionObserver.
      window.addEventListener('scroll', syncMobileCTA, { passive: true });
    }
    window.addEventListener('resize', syncMobileCTA, { passive: true });
  }
})();
