import Stripe from 'stripe';

const PRICE_IDS = {
  founding:   process.env.STRIPE_PRICE_FOUNDING,
  standard:   process.env.STRIPE_PRICE_STANDARD,
  full:       process.env.STRIPE_PRICE_FULL_ACCESS,
  partner:    process.env.STRIPE_PRICE_PARTNER,
};

const ALLOWED_TIERS = new Set(['founding', 'standard', 'full']);

// Attribution the page may send. Declared as a fixed list so Stripe metadata
// keeps a stable shape whether or not a given page supplies them yet.
const ATTRIBUTION_FIELDS = [
  'landing_page', 'page_variant', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term', 'fbclid', 'fbc', 'fbp', 'ga_client_id',
  'ga_session_id', 'referrer_host',
];

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizedAttribution(input = {}) {
  return Object.fromEntries(ATTRIBUTION_FIELDS.map(f => [f, cleanString(input[f])]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Checkout not yet configured' });
  }

  const {
    tier, addPartner, email, firstName, fbp, fbc, eventSourceUrl, retreat,
    locale, rfsn, attribution,
  } = req.body || {};

  // Every caller sends a tier from this set and a boolean addPartner, so a
  // value outside that is a malformed request rather than a customer.
  if (!ALLOWED_TIERS.has(tier)) {
    return res.status(400).json({ error: 'Invalid membership tier' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (typeof addPartner !== 'boolean') {
    return res.status(400).json({ error: 'Invalid partner selection' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  const lineItems = [
    {
      price:    tier === 'full' ? PRICE_IDS.full : tier === 'founding' ? PRICE_IDS.founding : PRICE_IDS.standard,
      quantity: 1,
    },
  ];

  // A missing price id would otherwise surface as an opaque Stripe error.
  if (!lineItems[0].price || (addPartner && !PRICE_IDS.partner)) {
    return res.status(503).json({ error: 'Checkout price not configured' });
  }

  if (addPartner) {
    lineItems.push({ price: PRICE_IDS.partner, quantity: 1 });
  }

  // Name/email captured in step one of the on-page checkout. Prefill Stripe so the
  // member never retypes, and carry the name through on the subscription metadata.
  // `retreat` is intent, not a line item: the member is buying the
  // membership so they can book that retreat at 20% off. Carried on both
  // the session and the subscription so it survives past checkout.
  const acquisition = normalizedAttribution({
    ...(attribution || {}),
    // Pages that do not send an attribution object yet still supply these.
    fbp:          (attribution && attribution.fbp) || fbp,
    fbc:          (attribution && attribution.fbc) || fbc,
    landing_page: (attribution && attribution.landing_page) || eventSourceUrl,
  });

  const metadata = {
    tier,
    addPartner: addPartner ? 'true' : 'false',
    firstName:  cleanString(firstName, 100),
    retreat:    cleanString(retreat, 200),
    ...acquisition,
  };

  // Meta CAPI match signals — captured from THIS request (the buyer's browser) and
  // carried on the Checkout Session metadata so the Stripe webhook can attribute the
  // server-side Purchase. The webhook itself fires from Stripe's servers and can't
  // see any of this. IP/UA come from the request headers; fbp/fbc from the pixel
  // cookies read browser-side and posted in the body.
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  // Refersion writes the affiliate ID to localStorage on prive-padel.com, but
  // Stripe returns the buyer to passport.prive-padel.com — a different origin,
  // where that localStorage is unreachable. Carried through Stripe metadata the
  // way the Meta signals below already are, so the confirmation page can read
  // it back and attribute the sale.
  const referral = {
    rfsn_id:  (rfsn && rfsn.id)  || '',
    rfsn_aid: (rfsn && rfsn.aid) || '',
    rfsn_cs:  (rfsn && rfsn.cs)  || '',
  };

  const capi = {
    fbp:       acquisition.fbp,
    fbc:       acquisition.fbc,
    client_ip: clientIp,
    client_ua: (req.headers['user-agent'] || '').slice(0, 500),
    src_url:   acquisition.landing_page,
  };

  // Stripe renders its own checkout, so Weglot cannot reach it — someone
  // browsing in Spanish would hit an English payment page at the moment
  // they pay. The page tells us which language it is showing; anything
  // unrecognised falls back to Stripe's own browser detection.
  const STRIPE_LOCALES = ['en', 'es'];
  const checkoutLocale = STRIPE_LOCALES.includes(locale) ? locale : 'auto';

  // A double-tap on a slow connection would otherwise open two Stripe
  // sessions. Only used when the page supplies a well-formed id — and passed
  // ONLY when set, because stripe-node rejects an empty options object as an
  // unknown argument, which would fail every checkout.
  const attemptId = cleanString(req.body?.checkoutAttemptId, 100);
  const createOptions = /^[A-Za-z0-9_-]{8,100}$/.test(attemptId)
    ? { idempotencyKey: `checkout_${attemptId}` }
    : null;

  const sessionParams = {
    mode:                 'subscription',
    locale:               checkoutLocale,
    line_items:           lineItems,
    allow_promotion_codes: true,
    ...(email ? { customer_email: email } : {}),
    metadata:             { ...metadata, ...capi, ...referral },
    subscription_data:    { metadata },
    success_url:          `https://passport.prive-padel.com/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `https://prive-padel.com/join`,
  };

  const session = createOptions
    ? await stripe.checkout.sessions.create(sessionParams, createOptions)
    : await stripe.checkout.sessions.create(sessionParams);

  return res.status(200).json({ url: session.url, sessionId: session.id });
}
