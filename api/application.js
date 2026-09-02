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

// ─── NOTIFICATIONS ────────────────────────────────────────────
// The page promises a same-day reply, so a submitted application has to
// reach a human inbox rather than only a Klaviyo dashboard. Same Resend
// path api/retreat-inquiry.js already uses in production.
//
// Both sends are non-fatal. By the time they run the application is
// already durable in Klaviyo, so failing the request would tell the
// applicant their application was lost when it wasn't — and would invite
// a retry that duplicates the record. A failure logs loudly instead.

const FROM_RAW = process.env.RESEND_FROM || 'inquiries@privepassport.com';
const FROM     = FROM_RAW.includes('<') ? FROM_RAW : `Privé Padel <${FROM_RAW}>`;
const TEAM     = 'chris@prive-padel.com';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ESC[c]);
// A subject line is a header, not HTML: entities would render literally.
// Strip markup and newlines instead, and keep it short enough to read in a
// notification list.
const subj = (v, max = 60) =>
  String(v == null ? '' : v).replace(/[<>\r\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// Only the review-led funnel promises a human reply. The original
// /passport-apply flow is self-serve — it ends at Stripe activation — so a
// "we'll be in touch today" email there would contradict its own page. Its
// behaviour is deliberately left exactly as it is.
const REVIEW_LED = new Set(['travel_desk_v2']);

const INTEREST_LABEL = {
  travel: 'Play while traveling',
  clubs: 'Privé Miami or Montauk',
  retreats: 'Signature retreats',
  hotel_benefits: 'Hotel and resort privileges',
  community: 'Community and events',
};
const TIMING_LABEL = {
  specific: 'A specific trip or club visit in mind',
  '1_3_months': 'Likely within 1–3 months',
  '4_12_months': 'Likely within 4–12 months',
  exploring: 'Exploring for the future',
};
const TIMING_SHORT = {
  specific: 'specific trip', '1_3_months': '1–3 months',
  '4_12_months': '4–12 months', exploring: 'exploring',
};

function sendEmail(payload, idempotencyKey) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      // A network timeout after Resend accepted the send would otherwise
      // let the page's retry deliver a second copy.
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  }).then(async r => {
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return r.json();
  });
}

// Everything interpolated below is applicant-supplied and lands in HTML.
function notificationHtml(d) {
  const rows = [
    ['Name', d.firstName],
    ['Email', d.email],
    ['Home city', d.homeCity || '—'],
    ['Wants it for', INTEREST_LABEL[d.primaryInterest] || '—'],
    ['Timing', TIMING_LABEL[d.useTiming] || '—'],
    ['Their note', d.destinationInterest || '—'],
    ['Marketing consent', d.marketingConsent ? 'Yes' : 'No'],
    ['Source', d.source],
    ['Landing page', d.landingPage || '—'],
    ['Submitted', d.submittedAt],
  ].map(([k, v]) => `
    <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.45);padding:12px 0 3px;">${esc(k)}</td></tr>
    <tr><td style="font-family:Georgia,serif;font-size:15px;color:rgba(255,255,255,.92);padding:0 0 13px;border-bottom:1px solid rgba(255,255,255,.07);">${esc(v)}</td></tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1B2A4A;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1B2A4A;"><tr><td align="center" style="padding:44px 20px;">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#243552;border-radius:4px;"><tr><td style="padding:44px;">
  <p style="font-size:10px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#B8976A;margin:0 0 8px;">Passport application</p>
  <h1 style="font-family:Georgia,serif;font-size:25px;font-weight:normal;font-style:italic;color:#fff;margin:0 0 6px;">${esc(d.firstName)}${d.homeCity ? ', ' + esc(d.homeCity) : ''}</h1>
  <p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:rgba(255,255,255,.5);margin:0 0 26px;">Reply to this email to answer them directly.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(184,151,106,.3);">${rows}</table>
  <p style="font-size:10px;letter-spacing:.1em;color:rgba(255,255,255,.28);margin:26px 0 0;">Application ${esc(d.applicationId)} · segment ${esc(d.segment)} · ${esc(d.variant)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

function confirmationHtml(d) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0E8;"><tr><td align="center" style="padding:48px 20px;">
<table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:#fff;"><tr><td style="padding:54px 48px 46px;">
  <p style="margin:0 0 30px;text-align:center;"><img src="https://res.cloudinary.com/dfjqa5f05/image/upload/q_auto,f_auto/v1773187743/logo_dark_drvkxb.png" alt="Privé Padel" width="150" style="width:150px;height:auto;border:0;"></p>
  <p style="font-size:10px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#B8976A;margin:0 0 18px;text-align:center;">Application received</p>
  <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal;font-style:italic;color:#1B2A4A;margin:0 0 30px;text-align:center;">Thank you, ${esc(d.firstName)}.</h1>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 32px;"><tr><td align="center"><div style="width:36px;height:1px;background:#B8976A;">&nbsp;</div></td></tr></table>
  <p style="font-family:Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.7;margin:0 0 18px;">Your application for Privé Passport is with our membership team now.</p>
  <p style="font-family:Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.7;margin:0 0 18px;">We read every application ourselves rather than passing them to a queue, so the reply you get will be a real one — and it will come today.</p>
  <p style="font-family:Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.7;margin:0 0 18px;">We may ask about a trip you have coming up, where you play at home, or what you are hoping Passport does for you. If it is a good fit, we will send you everything you need to join.</p>
  <p style="font-family:Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.7;margin:0 0 34px;">In the meantime, if there is anything you would like us to know — a destination you have in mind, a question about how the membership works — simply reply to this email.</p>
  <p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#1B2A4A;margin:0 0 44px;">— The Privé Passport membership team</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E5E0D8;padding-top:22px;">
    <p style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#9A8C78;margin:0;text-align:center;">Privé Padel · <a href="https://prive-padel.com" style="color:#B8976A;text-decoration:none;">prive-padel.com</a></p>
  </td></tr></table>
</td></tr></table></td></tr></table></body></html>`;
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

  // ── 3 · tell a human, and tell the applicant ────────────────
  // Awaited rather than fire-and-forget: the function can be frozen the
  // moment the response is returned, and an unsent notification is the one
  // failure the same-day promise cannot survive.
  if (stage === 'submitted' && REVIEW_LED.has(variant) && process.env.RESEND_API_KEY) {
    const d = {
      applicationId, email, firstName, homeCity, primaryInterest, useTiming,
      destinationInterest, marketingConsent, segment, variant,
      landingPage: acq.landing_page,
      source: [acq.utm_source, acq.utm_medium, acq.utm_campaign].filter(Boolean).join(' / ')
              || acq.referrer_host || 'direct',
      submittedAt: new Date(now).toLocaleString('en-US', {
        timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short',
      }) + ' ET',
    };
    const subject = `Passport application — ${subj(firstName, 32)}` +
      (homeCity ? `, ${subj(homeCity, 24)}` : '') +
      ` (${INTEREST_LABEL[primaryInterest] || 'unspecified'}, ${TIMING_SHORT[useTiming] || '—'})`;

    const [notify, confirm] = await Promise.allSettled([
      sendEmail({
        from: FROM, to: [TEAM], reply_to: email,
        subject, html: notificationHtml(d),
      }, `application-${applicationId}-team`),
      // Operational, not marketing — it goes out whether or not they opted in.
      sendEmail({
        from: FROM, to: [email], reply_to: TEAM,
        subject: 'We received your Privé Passport application',
        html: confirmationHtml(d),
      }, `application-${applicationId}-applicant`),
    ]);
    if (notify.status === 'rejected') {
      console.error('Application notification failed', { applicationId, reason: String(notify.reason) });
    }
    if (confirm.status === 'rejected') {
      console.error('Application confirmation failed', { applicationId, reason: String(confirm.reason) });
    }
  } else if (stage === 'submitted' && REVIEW_LED.has(variant)) {
    console.error('RESEND_API_KEY missing — application recorded but nobody notified', { applicationId });
  }

  // ── 4 · marketing consent, last and non-fatal ───────────────
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
