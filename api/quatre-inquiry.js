// Quatre project inquiries use the existing Resend account. One request
// sends one team notification; there is no visitor email or subscription.
// Retry the same inquiryId AND payload. Resend retains idempotency keys
// for 24 hours; this endpoint is not a durable inquiry database.

const TEAM = 'chris@quatrepadelcourts.com';
const SEND_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 32 * 1024;
const PROJECTS = {
  home: 'Private home',
  club: 'Country or racquet club',
  development: 'Development or resort',
  other: 'Other project',
};
const SUPPORT = {
  consulting: 'Project planning & consulting',
  court_supply: 'Court design & manufacturing',
  installation: 'Site preparation & installation',
  not_sure: 'Help defining the project',
  full_service: 'Complete court project',
  operations: 'Operational consulting',
};
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ESCAPES[character]);

class InputError extends Error {}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function field(input, name, max, { required = false, multiline = false, label = name } = {}) {
  const value = input[name];
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max) {
    throw new InputError(`Please check ${label}; use text up to ${max} characters.`);
  }
  // Only the free-text note accepts line breaks. Header-like fields never do.
  const normalized = multiline ? value.replace(/\r\n?/g, '\n') : value;
  if (CONTROL.test(multiline ? normalized.replace(/\n/g, '') : normalized)) {
    throw new InputError(`Please remove unsupported characters from ${label}.`);
  }
  const result = normalized.trim();
  if (required && !result) throw new InputError(`Please enter ${label}.`);
  return result;
}

function validEmail(value) {
  if (typeof value !== 'string' || value.length > 254 || CONTROL.test(value)) return false;
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && local.length <= 64
    && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)
    && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..')
    && domain.includes('.') && HOSTNAME.test(domain);
}

function validate(input) {
  if (!record(input)) throw new InputError('Please submit the inquiry form as a JSON object.');
  if (field(input, 'website', 200)) throw new InputError('Please check the form and try again.');

  const fullName = field(input, 'fullName', 120, { required: true, label: 'your full name' });
  const email = field(input, 'email', 254, { required: true, label: 'your email address' });
  if (!validEmail(email)) throw new InputError('Please enter a valid email address.');
  const location = field(input, 'location', 200, { required: true, label: 'the project location' });
  const projectType = field(input, 'projectType', 30, { required: true, label: 'the project type' });
  const support = field(input, 'support', 30, { required: true, label: 'the support you need' });
  if (!Object.hasOwn(PROJECTS, projectType)) throw new InputError('Please choose a project type from the form.');
  if (!Object.hasOwn(SUPPORT, support)) throw new InputError('Please choose the support you need from the form.');
  if (input.onBehalfOfClient !== undefined && typeof input.onBehalfOfClient !== 'boolean') {
    throw new InputError('Please check whether you are inquiring for a client.');
  }
  const inquiryId = field(input, 'inquiryId', 36, { required: true, label: 'a valid inquiry reference' }).toLowerCase();
  if (!UUID.test(inquiryId)) throw new InputError('Please reload the page to start a new inquiry.');

  const rawAttribution = input.attribution === undefined ? {} : input.attribution;
  if (!record(rawAttribution)) throw new InputError('Please reload the page and try again.');
  const attribution = {};
  for (const name of UTM_FIELDS) attribution[name] = field(rawAttribution, name, 200, { label: 'the campaign information' });
  attribution.landing_page = field(rawAttribution, 'landing_page', 512, { label: 'the landing page' });
  if (attribution.landing_page && (!/^\/(?!\/)/.test(attribution.landing_page) || /[?#\\]/.test(attribution.landing_page))) {
    throw new InputError('Please reload the page; the landing page must be a path without a query string.');
  }
  attribution.referrer_host = field(rawAttribution, 'referrer_host', 253, { label: 'the referring website' }).toLowerCase();
  if (attribution.referrer_host && !HOSTNAME.test(attribution.referrer_host)) {
    throw new InputError('Please reload the page; the referring website must be a hostname.');
  }

  return {
    fullName, email, location, projectType, support, inquiryId,
    onBehalfOfClient: input.onBehalfOfClient === true,
    company: field(input, 'company', 160, { label: 'your company name' }),
    phone: field(input, 'phone', 40, { label: 'your phone number' }),
    details: field(input, 'details', 3000, { multiline: true, label: 'your project details' }),
    attribution,
  };
}

function allowedBrowserRequest(req) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (typeof origin !== 'string' || typeof host !== 'string' || CONTROL.test(origin + host)) return false;
  if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return false;

  const allowedOrigins = new Set(['https://prive-padel.com', 'https://www.prive-padel.com']);
  // These are deployment-owned exact URLs, never a wildcard for other
  // customers' vercel.app sites. The client cannot supply this allowlist.
  for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']) {
    const raw = process.env[name];
    if (!raw) continue;
    try {
      const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
      if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) {
        allowedOrigins.add(url.origin);
      }
    } catch { /* A malformed deployment setting must not broaden access. */ }
  }
  try {
    const url = new URL(origin);
    return origin === url.origin && allowedOrigins.has(origin) && url.host === host.toLowerCase();
  } catch {
    return false;
  }
}

function notification(data, from) {
  const rows = [
    ['Name', data.fullName],
    ['Email', data.email],
    ['Project location', data.location],
    ['Project type', PROJECTS[data.projectType]],
    ['Support requested', SUPPORT[data.support]],
    ['Inquiring for a client', data.onBehalfOfClient ? 'Yes' : 'No'],
    ['Company', data.company || '—'],
    ['Phone', data.phone || '—'],
    ['Project details', data.details || '—'],
    ['Inquiry reference', data.inquiryId],
    ['Landing page', data.attribution.landing_page || '—'],
    ['Referring website', data.attribution.referrer_host || '—'],
    ...UTM_FIELDS.map(name => [name, data.attribution[name] || '—']),
  ];
  const htmlRows = rows.map(([label, value]) => `<tr><th scope="row" style="padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd;">${escapeHtml(label)}</th><td style="padding:12px;border-bottom:1px solid #ddd;overflow-wrap:anywhere;">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`).join('');
  const name = data.fullName.replace(/[<>]/g, '').replace(/\s+/g, ' ').slice(0, 80);
  return {
    from,
    to: [TEAM],
    reply_to: data.email,
    subject: `Quatre inquiry — ${PROJECTS[data.projectType]} · ${name}`,
    html: `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#f5f2ed;color:#182c28;font-family:Arial,sans-serif;"><h1 style="font-size:24px;">Quatre Padel Courts</h1><p>New project inquiry. Reply to this email to answer the requester.</p><table style="width:100%;max-width:760px;border-collapse:collapse;background:#fff;">${htmlRows}</table></body></html>`,
    text: `QUATRE PADEL COURTS\nNew project inquiry. Reply to answer the requester.\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n\n')}`,
  };
}

function fail(res, status, code, error, retryAfter) {
  if (retryAfter) res.setHeader('Retry-After', String(retryAfter));
  return res.status(status).json({ ok: false, code, error });
}

function unavailable(res) {
  return fail(res, 503, 'DELIVERY_UNAVAILABLE', `We could not confirm your inquiry was sent. Please try again shortly, or email ${TEAM}.`, 60);
}

function logDeliveryFailure(code, status) {
  // Coarse operational diagnostics only: no request, inquiry ID, email,
  // credentials, upstream response body, or exception object.
  const details = { code };
  if (Number.isInteger(status) && status >= 100 && status <= 599) details.status = status;
  console.error('quatre_inquiry_delivery', details);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Please use the inquiry form to send your request.');
  }
  if (!allowedBrowserRequest(req)) {
    return fail(res, 400, 'INVALID_ORIGIN', 'Please open the Quatre page on this website, then submit the form again.');
  }
  const contentType = req.headers['content-type'];
  if (typeof contentType !== 'string' || contentType.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return fail(res, 400, 'INVALID_INPUT', 'Please submit the inquiry form as JSON.');
  }

  let data;
  try {
    const length = req.headers['content-length'];
    if (length !== undefined && (typeof length !== 'string' || !/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
      throw new InputError('Please shorten the inquiry and try again.');
    }
    // Vercel's lazy body getter can throw for malformed JSON.
    let body = req.body;
    const serialized = typeof body === 'string' ? body : JSON.stringify(body);
    if (!serialized || Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES) {
      throw new InputError('Please shorten the inquiry and try again.');
    }
    if (typeof body === 'string') body = JSON.parse(body);
    data = validate(body);
  } catch (error) {
    return fail(res, 400, 'INVALID_INPUT', error instanceof InputError ? error.message : 'Please check the form and try again.');
  }

  const key = process.env.RESEND_API_KEY;
  const rawFrom = (process.env.RESEND_FROM || 'inquiries@privepassport.com').trim();
  const fromAddress = rawFrom.includes('<') ? rawFrom.match(/^[^<>]+<([^<>]+)>$/)?.[1]?.trim() : rawFrom;
  if (!key || /\s/.test(key) || CONTROL.test(rawFrom) || !validEmail(fromAddress)) {
    logDeliveryFailure('CONFIG_UNAVAILABLE');
    return unavailable(res);
  }
  const from = rawFrom.includes('<') ? rawFrom : `Quatre Padel Courts <${rawFrom}>`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    // No timestamp or other per-attempt value is included in the payload.
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `quatre-inquiry/${data.inquiryId}`,
      },
      body: JSON.stringify(notification(data, from)),
      signal: controller.signal,
    });
    if (response.status === 429) {
      logDeliveryFailure('PROVIDER_RATE_LIMIT', response.status);
      const rawRetry = response.headers?.get('retry-after') || '';
      const retry = /^\d+$/.test(rawRetry) ? Math.min(3600, Math.max(1, Number(rawRetry))) : 60;
      return fail(res, 429, 'TRY_LATER', `Please wait a little before trying again, or email ${TEAM}.`, retry);
    }
    if (response.status === 409) {
      const conflict = await response.json();
      if (conflict?.name === 'invalid_idempotent_request') {
        logDeliveryFailure('IDEMPOTENCY_CONFLICT', response.status);
        return fail(res, 400, 'INQUIRY_CHANGED', `An earlier version of this inquiry may already have been sent. Please email ${TEAM} with any changes.`);
      }
      logDeliveryFailure('PROVIDER_REQUEST_IN_PROGRESS', response.status);
      return fail(res, 429, 'TRY_LATER', 'Your inquiry may still be processing. Please wait a moment and try again.', 2);
    }
    if (!response.ok) {
      logDeliveryFailure('PROVIDER_REJECTED', response.status);
      return unavailable(res);
    }
    const accepted = await response.json();
    if (!accepted || typeof accepted.id !== 'string' || !accepted.id.trim()) {
      logDeliveryFailure('PROVIDER_ACKNOWLEDGEMENT_INVALID', response.status);
      return unavailable(res);
    }
    return res.status(200).json({ ok: true, inquiryId: data.inquiryId });
  } catch {
    logDeliveryFailure(controller.signal.aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_REQUEST_FAILED');
    return unavailable(res);
  } finally {
    clearTimeout(timeout);
  }
}
