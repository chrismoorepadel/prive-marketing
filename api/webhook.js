import Stripe from 'stripe';

// Vercel: disable body parsing so we can verify Stripe's raw signature
export const config = { api: { bodyParser: false } };

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

    await Promise.all([

      // GA4 Measurement Protocol
      fetch(
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
      ),

      // Meta Conversions API
      fetch(
        `https://graph.facebook.com/v19.0/2265018770516086/events?access_token=${process.env.META_PIXEL_ACCESS_TOKEN}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              event_name:        'Purchase',
              event_time:        Math.floor(Date.now() / 1000),
              action_source:     'website',
              event_source_url:  'https://prive-padel.com/join',
              event_id:          session.id,
              user_data: {
                em: session.customer_details?.email
                  ? [session.customer_details.email]
                  : [],
              },
              custom_data: {
                value,
                currency:     'USD',
                content_ids:  [tier],
                content_type: 'product',
              },
            }],
          }),
        }
      ),

    ]);
  }

  res.status(200).json({ received: true });
}
