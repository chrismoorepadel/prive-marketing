import Stripe from 'stripe';
import crypto from 'node:crypto';

// Vercel: disable body parsing so we can verify Stripe's raw signature
export const config = { api: { bodyParser: false } };

// Meta CAPI requires PII (email, name) SHA-256 hashed after normalizing
// (trim + lowercase). fbp/fbc/IP/user-agent are sent raw, never hashed.
function sha256(v) {
  return crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const rawBody = await getRawBody(req);
  const sig     = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature invalid' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const tier    = session.metadata?.tier || 'standard';
    const value   = session.amount_total ? session.amount_total / 100 : 0;
    const email   = session.customer_details?.email || session.customer_email || '';

    // Stripe delivers checkout.session.completed to the Passport portal too, which
    // owns conversion tracking — so GA4/Meta Purchase are OFF here by default to
    // avoid double-counting. Set ENABLE_MARKETING_ANALYTICS=true only if the portal
    // does NOT already send server-side Purchase events.
    const sendAnalytics = process.env.ENABLE_MARKETING_ANALYTICS === 'true';

    try {
      await Promise.all([

        // Klaviyo "Placed Order" — the exclusion signal for the abandoned-checkout
        // flow. Matched to the captured profile by email, so the flow filter
        // ("has not Placed Order since starting") skips anyone who converted.
        ...(email ? [fetch('https://a.klaviyo.com/api/events/', {
          method:  'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
            'revision': '2024-10-15',
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: {
              type: 'event',
              attributes: {
                metric:    { data: { type: 'metric', attributes: { name: 'Placed Order' } } },
                profile:   { data: { type: 'profile', attributes: { email } } },
                properties: { tier },
                value,
                unique_id: session.id,
              }
            }
          })
        })] : []),

        // GA4 Measurement Protocol (gated — see ENABLE_MARKETING_ANALYTICS above)
        ...(sendAnalytics ? [fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=G-V7WWTFXWSE&api_secret=${process.env.GA4_API_SECRET}`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: session.customer || session.id,
              events: [{
                name: 'purchase',
                params: {
                  transaction_id: session.id,
                  value,
                  currency: 'USD',
                  items: [{
                    item_id:   tier,
                    item_name: tier === 'full' ? 'Privé Passport Full Access' : 'Privé Passport Standard',
                    price:     value,
                    quantity:  1,
                  }],
                },
              }],
            }),
          }
        )] : []),

        // Meta Conversions API (gated — see ENABLE_MARKETING_ANALYTICS above).
        // Match signals (fbp/fbc/IP/UA/source URL) are captured browser-side at
        // checkout creation and carried on session.metadata, because this webhook
        // fires from Stripe's servers and can't see the buyer's browser.
        // event_id === session.id so any browser-side Purchase with the same id
        // deduplicates against this server event.
        ...(sendAnalytics ? [fetch(
          `https://graph.facebook.com/v19.0/2265018770516086/events?access_token=${process.env.META_PIXEL_ACCESS_TOKEN}`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [{
                event_name:        'Purchase',
                event_time:        Math.floor(Date.now() / 1000),
                action_source:     'website',
                event_source_url:  session.metadata?.src_url || 'https://prive-padel.com/passport-offer-v2',
                event_id:          session.id,
                user_data: {
                  ...(email ? { em: [sha256(email)] } : {}),
                  ...(session.metadata?.firstName ? { fn: [sha256(session.metadata.firstName)] } : {}),
                  ...(session.metadata?.fbp ? { fbp: session.metadata.fbp } : {}),
                  ...(session.metadata?.fbc ? { fbc: session.metadata.fbc } : {}),
                  ...(session.metadata?.client_ip ? { client_ip_address: session.metadata.client_ip } : {}),
                  ...(session.metadata?.client_ua ? { client_user_agent: session.metadata.client_ua } : {}),
                },
                custom_data: {
                  value,
                  currency:     'USD',
                  content_ids:  [tier],
                  content_type: 'product',
                },
              }],
              // Set META_TEST_EVENT_CODE to route events to Events Manager →
              // Test Events for verification. Leave unset in normal production.
              ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
            }),
          }
        )] : []),

      ]);
    } catch (err) {
      console.error('Analytics dispatch error:', err);
    }
  }

  res.status(200).json({ received: true });
}
