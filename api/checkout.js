import Stripe from 'stripe';

const PRICE_IDS = {
  standard:   process.env.STRIPE_PRICE_STANDARD,
  full:       process.env.STRIPE_PRICE_FULL_ACCESS,
  partner:    process.env.STRIPE_PRICE_PARTNER,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Checkout not yet configured' });
  }

  const { tier, addPartner } = req.body;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  const lineItems = [
    {
      price:    tier === 'full' ? PRICE_IDS.full : PRICE_IDS.standard,
      quantity: 1,
    },
  ];

  if (addPartner) {
    lineItems.push({ price: PRICE_IDS.partner, quantity: 1 });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  const session = await stripe.checkout.sessions.create({
    mode:                 'subscription',
    line_items:           lineItems,
    allow_promotion_codes: true,
    success_url:          `${origin}/welcome.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `${origin}/join.html`,
  });

  return res.status(200).json({ url: session.url });
}
