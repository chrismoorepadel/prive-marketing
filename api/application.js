// ─── PASSPORT APPLICATION ─────────────────────────────────────
// Receives the /passport-apply funnel. Klaviyo is the system of record:
// the profile carries the application, the event drives the flow.
//
// Ordering matters. subscribe.js put a list subscription first and
// returned 500 when it failed, which silently killed the Started Checkout
// event beneath it for four weeks. Here the application is written first
// and the optional marketing subscription is last and non-fatal, so a
// misconfigured list can never cost an application.

const KLAVIYO = 'https://a.klaviyo.com/api';
const REVISION = '2024-10-15';

const INTERESTS = new Set(['travel', 'clubs', 'retreats', 'hotel_benefits', 'community']);
const TIMINGS   = new Set(['specific', '1_3_months', '4_12_months', 'exploring']);

// Mirrors api/checkout.js so an application and a checkout describe their
// acquisition the same way.
const ATTRIBUTION_FIELDS = [
  'landing_page', 'page_variant', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term', 'fbclid', 'fbc', 'fbp', 'ga_client_id',
  'ga_session_id', 'referrer_host',
];

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function attribution(input = {}) {
  return Object.fromEntries(ATTRIBUTION_FIELDS.map(f => [f, clean(input[f], 500)]));
}

// §5. Timing is the dominant axis; a named club or retreat interest promotes
// "this year" to "ready now" because that person has something specific in
// mind. Exploratory timing stays exploring whatever the interest.
function intentSegment(useTiming, primaryInterest) {
  if (useTiming === 'exploring') return 'exploring';
  if (useTiming === 'specific' || useTiming === '1_3_months') return 'ready_now';
  if (primaryInterest === 'clubs' || primaryInterest === 'retreats') return 'ready_now';
  return 'this_year';
}

function klaviyo(path, body) {
  return fetch(`${KLAVIYO}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      'revision': REVISION,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.KLAVIYO_PRIVATE_KEY) {
    return res.status(503).json({ error: 'Applications not yet configured' });
  }

  const b = req.body || {};

  // ── validate ────────────────────────────────────────────────
  const stage = b.stage === 'started' ? 'started' : 'submitted';
  const applicationId = clean(b.applicationId, 64);
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(applicationId)) {
    return res.status(400).json({ error: 'Invalid application id' });
  }

  const email = clean(b.email, 320).toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Valid email required' });

  const firstName          = clean(b.firstName, 80);
  const homeCity           = clean(b.homeCity, 120);
  const destinationInterest = clean(b.destinationInterest, 160);
  const notes              = clean(b.notes, 1000);
  const primaryInterest    = INTERESTS.has(b.primaryInterest) ? b.primaryInterest : '';
  const useTiming          = TIMINGS.has(b.useTiming) ? b.useTiming : '';
  const marketingConsent   = b.marketingConsent === true;
  const variant            = clean(b.variant, 40) || 'application_v1';

  if (stage === 'submitted') {
    if (!firstName)       return res.status(400).json({ error: 'First name required' });
    if (!primaryInterest) return res.status(400).json({ error: 'Membership interest required' });
    if (!useTiming)       return res.status(400).json({ error: 'Expected use required' });
  }

  const acq = attribution(b.attribution);
  const segment = stage === 'submitted' ? intentSegment(useTiming, primaryInterest) : '';
  const now = new Date().toISOString();

  // ── 1 · the application itself, on the profile ──────────────
  // profile-import upserts by email and does NOT subscribe anyone, so an
  // applicant who declined marketing is recorded without being marketed to.
  const properties = {
    passport_application_id:      applicationId,
    passport_application_date:    now,
    passport_application_variant: variant,
    passport_application_stage:   stage,
    passport_marketing_consent:   marketingConsent,
    ...(homeCity            ? { passport_home_city: homeCity } : {}),
    ...(primaryInterest     ? { passport_primary_interest: primaryInterest } : {}),
    ...(useTiming           ? { passport_use_timing: useTiming } : {}),
    ...(destinationInterest ? { passport_destination_interest: destinationInterest } : {}),
    ...(segment             ? { passport_intent_segment: segment } : {}),
    // Free text is kept short and only here — never in analytics. §4, §8.
    ...(notes               ? { passport_application_notes: notes.slice(0, 500) } : {}),
    ...acq,
  };

  const profileRes = await klaviyo('profile-import/', {
    data: {
      type: 'profile',
      attributes: {
        email,
        ...(firstName ? { first_name: firstName } : {}),
        ...(homeCity ? { location: { city: homeCity } } : {}),
        properties,
      },
    },
  });

  if (!profileRes.ok) {
    // applicationId only — never the applicant's details. §4, §8.
    console.error('Application profile write failed', {
      applicationId, status: profileRes.status,
    });
    return res.status(500).json({ error: 'Could not save application' });
  }

  // ── 2 · the event that drives the flow ──────────────────────
  // unique_id = applicationId, so a retry or double-tap records once. §11.3
  const metric = stage === 'started'
    ? 'Passport Application Started'
    : 'Passport Application Submitted';

  const eventRes = await klaviyo('events/', {
    data: {
      type: 'event',
      attributes: {
        metric:  { data: { type: 'metric', attributes: { name: metric } } },
        profile: { data: { type: 'profile', attributes: { email, ...(firstName ? { first_name: firstName } : {}) } } },
        properties: {
          application_id:   applicationId,
          variant,
          ...(segment         ? { intent_segment: segment } : {}),
          ...(primaryInterest ? { primary_interest: primaryInterest } : {}),
          ...(useTiming       ? { use_timing: useTiming } : {}),
          ...(destinationInterest ? { destination_interest: destinationInterest } : {}),
          marketing_consent: marketingConsent,
          ...acq,
        },
        unique_id: `${applicationId}:${stage}`,
        time: now,
      },
    },
  });

  if (!eventRes.ok) {
    console.error('Application event failed', { applicationId, stage, status: eventRes.status });
    // The profile is already written, so the application is not lost. Report
    // failure so the page can retry with the same id.
    return res.status(500).json({ error: 'Could not record application' });
  }

  // ── 3 · marketing consent, last and non-fatal ───────────────
  // A missing or wrong list id must never cost an application.
  const marketingList = process.env.KLAVIYO_APPLICATION_LIST_ID || process.env.KLAVIYO_LIST_ID;
  if (marketingConsent && marketingList) {
    klaviyo('profile-subscription-bulk-create-jobs/', {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          custom_source: 'passport_application',
          profiles: { data: [{ type: 'profile', attributes: {
            email,
            subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
          } }] },
        },
        relationships: { list: { data: { type: 'list', id: marketingList } } },
      },
    }).then(r => {
      if (!r.ok) console.error('Marketing subscribe failed', { applicationId, status: r.status });
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true, applicationId, segment });
}
