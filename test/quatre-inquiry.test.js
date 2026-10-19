import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/quatre-inquiry.js';

const ENV_NAMES = ['RESEND_API_KEY', 'RESEND_FROM', 'VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL'];
const savedEnv = Object.fromEntries(ENV_NAMES.map(name => [name, process.env[name]]));
const realFetch = globalThis.fetch;
const TEAM = 'chris@prive-padel.com';
const ID = '9d7bd616-7cab-4aa4-b4ce-0b361a068ec8';
let calls;
let deliveryLogs;

beforeEach(t => {
  for (const name of ENV_NAMES) delete process.env[name];
  process.env.RESEND_API_KEY = 'test-key-never-live';
  calls = [];
  deliveryLogs = [];
  t.mock.method(console, 'error', (...args) => deliveryLogs.push(args));
  // Every test installs a stub before invoking the handler. No real request
  // can reach Resend, including for unexpected payloads or extra sends.
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, { id: 'provider-message-id' });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const name of ENV_NAMES) {
    if (savedEnv[name] === undefined) delete process.env[name];
    else process.env[name] = savedEnv[name];
  }
});

function body(overrides = {}) {
  return {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    location: 'Palm Beach, Florida',
    projectType: 'home',
    support: 'consulting',
    inquiryId: ID,
    website: '',
    ...overrides,
  };
}

function request(payload = body(), headers = {}, method = 'POST') {
  return {
    method,
    headers: {
      host: 'prive-padel.com',
      origin: 'https://prive-padel.com',
      'sec-fetch-site': 'same-origin',
      'content-type': 'application/json',
      ...headers,
    },
    body: payload,
  };
}

function result() {
  return {
    headers: {},
    statusCode: undefined,
    value: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.value = value; return this; },
  };
}

function response(status, json, headers = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => json, headers: new Headers(headers) };
}

async function invoke(payload = body(), headers = {}, method = 'POST') {
  const res = result();
  await handler(request(payload, headers, method), res);
  return res;
}

test('one accepted inquiry notifies only the team with the visitor as reply-to', async () => {
  const res = await invoke(body({
    company: 'Example Studio', phone: '+1 555 0100', onBehalfOfClient: true,
    details: 'Two courts for a client.',
    attribution: { utm_source: 'partner', utm_campaign: 'builders', landing_page: '/quatre', referrer_host: 'example.com' },
    to: 'not-a-recipient@example.com', marketingConsent: true,
  }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.value, { ok: true, inquiryId: ID });
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.method, 'POST');
  const notification = JSON.parse(calls[0].options.body);
  assert.deepEqual(notification.to, [TEAM]);
  assert.equal(notification.reply_to, 'alex@example.com');
  assert.equal(notification.from, 'Quatre Padel Courts <inquiries@privepassport.com>');
  assert.equal(notification.cc, undefined);
  assert.equal(notification.bcc, undefined);
  assert.match(notification.text, /Example Studio/);
  assert.match(notification.text, /Inquiring for a client: Yes/);
  assert.match(notification.text, /Support requested: Project consulting/);
  assert.match(notification.text, /utm_campaign: builders/);
  assert.doesNotMatch(notification.text, /marketingConsent|not-a-recipient/);
  assert.equal(calls[0].options.headers['Idempotency-Key'], `quatre-inquiry/${ID}`);
});

test('does not return success until the provider returns an accepted message id', async () => {
  let resolveSend;
  globalThis.fetch = () => new Promise(resolve => { resolveSend = resolve; });
  const res = result();
  const pending = handler(request(), res);
  assert.equal(res.value, undefined);
  resolveSend(response(200, { id: 'accepted-id' }));
  await pending;
  assert.equal(res.statusCode, 200);
});

test('identical retries produce byte-identical payloads and keys despite object order and extra fields', async () => {
  const original = body({ attribution: { utm_source: 'email', utm_campaign: 'court_sales', landing_page: '/quatre' } });
  await invoke(original);
  await invoke({ attribution: { landing_page: '/quatre', utm_campaign: 'court_sales', utm_source: 'email' }, ...body(), unused: 'ignored' });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.body, calls[1].options.body);
  assert.equal(calls[0].options.headers['Idempotency-Key'], calls[1].options.headers['Idempotency-Key']);
  assert.doesNotMatch(calls[0].options.body, /submittedAt|timestamp/);
});

test('notification labels preserve the selected offer without broadening its scope', async () => {
  await invoke(body({ support: 'installation', projectType: 'development' }));
  await invoke(body({ support: 'court_supply', projectType: 'club' }));
  assert.match(JSON.parse(calls[0].options.body).text, /Support requested: Installation coordination/);
  assert.match(JSON.parse(calls[0].options.body).text, /Project type: Development or resort/);
  assert.match(JSON.parse(calls[1].options.body).text, /Support requested: Court supply quotation/);
  assert.match(JSON.parse(calls[1].options.body).text, /Project type: Country or racquet club/);
});

test('a network failure can be retried with the exact same notification', async () => {
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) throw new Error('private upstream details');
    return response(200, { id: 'original-send-id' });
  };
  const failed = await invoke();
  const retried = await invoke();
  assert.equal(failed.statusCode, 503);
  assert.equal(retried.statusCode, 200);
  assert.equal(calls[0].options.body, calls[1].options.body);
  assert.equal(calls[0].options.headers['Idempotency-Key'], calls[1].options.headers['Idempotency-Key']);
  assert.doesNotMatch(JSON.stringify(failed.value), /private upstream details/);
  assert.deepEqual(deliveryLogs, [['quatre_inquiry_delivery', { code: 'PROVIDER_REQUEST_FAILED' }]]);
});

test('escapes visitor HTML and strips header markup while preserving readable multiline details', async () => {
  await invoke(body({
    fullName: 'Alex <b>Example</b>', company: 'A & B "Design"',
    details: '<script>alert("x")</script>\r\nSecond line',
    attribution: { utm_source: "<img src=x onerror='bad'>" },
  }));
  const notification = JSON.parse(calls[0].options.body);
  assert.doesNotMatch(notification.html, /<script>|<img/);
  assert.match(notification.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;<br>Second line/);
  assert.match(notification.html, /A &amp; B &quot;Design&quot;/);
  assert.match(notification.html, /&#39;bad&#39;/);
  assert.doesNotMatch(notification.subject, /[<>\r\n]/);
});

test('honors a configured sender and accepts JSON text and charset', async () => {
  process.env.RESEND_FROM = 'Quatre Team <inquiries@privepassport.com>';
  const res = await invoke(JSON.stringify(body()), { 'content-type': 'application/json; charset=utf-8' });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(calls[0].options.body).from, process.env.RESEND_FROM);
});

test('rejects malformed, missing, non-object, and oversized JSON before sending', async () => {
  for (const invalid of ['{', null, [], '[]', 'null', 42, { extra: 'a'.repeat(32769) }]) {
    const res = await invoke(invalid);
    assert.equal(res.statusCode, 400);
    assert.equal(res.value.ok, false);
  }
  const req = request();
  Object.defineProperty(req, 'body', { get() { throw new SyntaxError('private parse value'); } });
  const res = result();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.doesNotMatch(JSON.stringify(res.value), /private parse value/);
  assert.equal((await invoke(body(), { 'content-length': '32769' })).statusCode, 400);
  assert.equal(calls.length, 0);
});

test('rejects missing fields, invalid types, enums, UUIDs, and email header injection', async () => {
  const invalid = [
    { fullName: '' }, { fullName: 5 }, { fullName: 'Alex\r\nBcc: x@example.com' },
    { email: '' }, { email: 'a@example.com\r\nBcc: x@example.com' }, { email: 'a@example.com,b@example.com' },
    { email: 'Name <a@example.com>' }, { email: '.a@example.com' }, { email: 'a..b@example.com' },
    { email: 'a@-example.com' }, { email: 'a@example' },
    { location: ' ' }, { location: ['Miami'] }, { projectType: 'hotel' }, { projectType: 'toString' },
    { support: 'other' }, { support: 'constructor' }, { support: undefined },
    { inquiryId: 'arbitrary-key' }, { inquiryId: undefined },
    { onBehalfOfClient: 'true' }, { onBehalfOfClient: null },
    { company: {} }, { phone: 123 }, { details: ['message'] }, { details: 'bad\u0000note' },
    { attribution: [] }, { attribution: null }, { website: 0 },
  ];
  for (const changes of invalid) {
    const res = await invoke(body(changes));
    assert.equal(res.statusCode, 400, JSON.stringify(changes));
    assert.equal(res.value.ok, false);
  }
  assert.equal(calls.length, 0);
});

test('enforces all field limits without truncating a prospective lead', async () => {
  for (const [name, max] of Object.entries({ fullName: 120, email: 254, location: 200, company: 160, phone: 40, details: 3000 })) {
    const res = await invoke(body({ [name]: 'a'.repeat(max + 1) }));
    assert.equal(res.statusCode, 400, name);
  }
  for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    assert.equal((await invoke(body({ attribution: { [name]: 'x'.repeat(201) } }))).statusCode, 400, name);
  }
  assert.equal(calls.length, 0);
  const accepted = await invoke(body({ fullName: 'a'.repeat(120), location: 'b'.repeat(200), company: 'c'.repeat(160), phone: '1'.repeat(40), details: 'd'.repeat(3000) }));
  assert.equal(accepted.statusCode, 200);
});

test('attribution contains only bounded campaign fields, a pathname, and a hostname', async () => {
  for (const attribution of [
    { landing_page: 'https://example.com/quatre' }, { landing_page: '//example.com' },
    { landing_page: '/quatre?email=private@example.com' }, { landing_page: '/quatre#contact' },
    { landing_page: '/\\example.com' }, { landing_page: '/' + 'a'.repeat(512) },
    { referrer_host: 'https://example.com/path' }, { referrer_host: 'example.com?private=data' },
    { referrer_host: 'example.com:443' }, { utm_medium: 5 },
  ]) {
    assert.equal((await invoke(body({ attribution }))).statusCode, 400);
  }
  assert.equal(calls.length, 0);
  const accepted = await invoke(body({ attribution: { landing_page: '/quatre', referrer_host: 'WWW.EXAMPLE.COM', unknown_personal_data: 'omit me' } }));
  assert.equal(accepted.statusCode, 200);
  assert.match(calls[0].options.body, /www.example.com/);
  assert.doesNotMatch(calls[0].options.body, /omit me|unknown_personal_data/);
});

test('a populated honeypot never counts as a successful inquiry or sends a notification', async () => {
  const res = await invoke(body({ website: 'https://spam.example' }));
  assert.equal(res.statusCode, 400);
  assert.equal(res.value.ok, false);
  assert.equal(calls.length, 0);
});

test('rejects other methods and browser form encodings without enabling CORS', async () => {
  for (const method of ['GET', 'PUT', 'OPTIONS']) {
    const res = await invoke(body(), {}, method);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.allow, 'POST');
    assert.equal(res.headers['access-control-allow-origin'], undefined);
  }
  for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data', undefined]) {
    assert.equal((await invoke(body(), { 'content-type': type })).statusCode, 400);
  }
  assert.equal(calls.length, 0);
});

test('blocks cross-site, missing/null, forged, and untrusted Vercel origins', async () => {
  for (const headers of [
    { origin: 'https://evil.example' }, { origin: 'null' }, { origin: undefined },
    { origin: 'https://prive-padel.com/path' }, { origin: 'https://prive-padel.com@evil.example' },
    { origin: 'https://prive-padel.com', host: 'evil.example' },
    { origin: 'https://evil.vercel.app', host: 'evil.vercel.app' },
    { origin: 'https://prive-padel.com.evil.example', host: 'prive-padel.com.evil.example' },
    { origin: 'http://prive-padel.com' }, { 'sec-fetch-site': 'cross-site' },
    { 'sec-fetch-site': 'same-site' }, { origin: ['https://prive-padel.com'] },
  ]) {
    assert.equal((await invoke(body(), headers)).statusCode, 400, JSON.stringify(headers));
  }
  assert.equal(calls.length, 0);
});

test('allows same-origin production and only exact deployment-owned preview URLs', async () => {
  process.env.VERCEL_URL = 'prive-marketing-123abc-team.vercel.app';
  process.env.VERCEL_BRANCH_URL = 'prive-marketing-git-quatre-team.vercel.app';
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prive-marketing.vercel.app';
  const hosts = ['www.prive-padel.com', process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL];
  for (const host of hosts) {
    assert.equal((await invoke(body(), { host, origin: `https://${host}` })).statusCode, 200);
  }
  assert.equal((await invoke(body(), { host: 'prive-marketing-123abc-team.vercel.app.evil.example', origin: 'https://prive-marketing-123abc-team.vercel.app.evil.example' })).statusCode, 400);
  assert.equal((await invoke(body(), { origin: `https://${process.env.VERCEL_URL}` })).statusCode, 400);
});

test('missing or invalid server configuration records only a coarse code and makes no request', async () => {
  delete process.env.RESEND_API_KEY;
  let res = await invoke();
  assert.equal(res.statusCode, 503);
  assert.match(res.value.error, /try again|email/);
  process.env.RESEND_API_KEY = 'test-key-never-live';
  process.env.RESEND_FROM = 'inquiries@privepassport.com\r\nBcc: private@example.com';
  res = await invoke();
  assert.equal(res.statusCode, 503);
  assert.equal(calls.length, 0);
  assert.deepEqual(deliveryLogs, [
    ['quatre_inquiry_delivery', { code: 'CONFIG_UNAVAILABLE' }],
    ['quatre_inquiry_delivery', { code: 'CONFIG_UNAVAILABLE' }],
  ]);
  assert.doesNotMatch(JSON.stringify(res.value), /test-key|Bcc|private@example.com/);
});

test('provider rejection, missing ids, and malformed response JSON never count as success', async () => {
  for (const upstream of [response(401, { error: 'secret' }), response(422, {}), response(500, {}), response(200, {}), response(200, { id: '' }), response(200, { id: 42 })]) {
    globalThis.fetch = async () => upstream;
    const res = await invoke();
    assert.equal(res.statusCode, 503);
    assert.equal(res.value.ok, false);
    assert.equal(res.headers['retry-after'], '60');
  }
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new Error('private response'); } });
  assert.equal((await invoke()).statusCode, 503);
  assert.deepEqual(deliveryLogs, [
    ['quatre_inquiry_delivery', { code: 'PROVIDER_REJECTED', status: 401 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_REJECTED', status: 422 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_REJECTED', status: 500 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_ACKNOWLEDGEMENT_INVALID', status: 200 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_ACKNOWLEDGEMENT_INVALID', status: 200 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_ACKNOWLEDGEMENT_INVALID', status: 200 }],
    ['quatre_inquiry_delivery', { code: 'PROVIDER_REQUEST_FAILED' }],
  ]);
  assert.doesNotMatch(JSON.stringify(deliveryLogs), /private response|secret|alex@example.com|test-key/);
});

test('provider rate limits and in-flight retries are actionable without exposing the upstream response', async () => {
  globalThis.fetch = async () => response(429, { message: 'private provider details' }, { 'retry-after': '120' });
  let res = await invoke();
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers['retry-after'], '120');
  assert.doesNotMatch(JSON.stringify(res.value), /private provider details/);
  globalThis.fetch = async () => response(409, { name: 'concurrent_idempotent_requests' });
  res = await invoke();
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers['retry-after'], '2');
});

test('a changed payload using an existing key asks for a direct update instead of silently sending again', async () => {
  globalThis.fetch = async () => response(409, { name: 'invalid_idempotent_request', message: 'private payload' });
  const res = await invoke();
  assert.equal(res.statusCode, 400);
  assert.equal(res.value.code, 'INQUIRY_CHANGED');
  assert.match(res.value.error, /earlier version|email/);
  assert.doesNotMatch(JSON.stringify(res.value), /private payload/);
});

test('a hung provider call is aborted after the configured timeout and returns a retryable failure', async t => {
  let timerCallback;
  let timerDelay;
  let signal;
  const timer = {};
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => { timerCallback = callback; timerDelay = delay; return timer; });
  const clear = t.mock.method(globalThis, 'clearTimeout', () => {});
  globalThis.fetch = async (_url, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  };
  const res = result();
  const pending = handler(request(), res);
  assert.equal(timerDelay, 8000);
  assert.equal(res.value, undefined);
  timerCallback();
  await pending;
  assert.equal(signal.aborted, true);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(deliveryLogs, [['quatre_inquiry_delivery', { code: 'PROVIDER_TIMEOUT' }]]);
  assert.equal(clear.mock.calls[0].arguments[0], timer);
});
