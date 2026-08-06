import Stripe from 'stripe';

const PRICE_IDS = {
  founding:   process.env.STRIPE_PRICE_FOUNDING,
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

  const { tier, addPartner, email, firstName, fbp, fbc, eventSourceUrl, retreat } = req.body;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  const lineItems = [
    {
      price:    tier === 'full' ? PRICE_IDS.full : tier === 'founding' ? PRICE_IDS.founding : PRICE_IDS.standard,
      quantity: 1,
    },
  ];

  if (addPartner) {
    lineItems.push({ price: PRICE_IDS.partner, quantity: 1 });
  }

  // Name/email captured in step one of the on-page checkout. Prefill Stripe so the
  // member never retypes, and carry the name through on the subscription metadata.
  // `retreat` is intent, not a line item: the member is buying the
  // membership so they can book that retreat at 20% off. Carried on both
  // the session and the subscription so it survives past checkout.
  const metadata = {
    tier,
    addPartner: addPartner ? 'true' : 'false',
    firstName:  firstName || '',
    retreat:    retreat || '',
  };

  // Meta CAPI match signals — captured from THIS request (the buyer's browser) and
  // carried on the Checkout Session metadata so the Stripe webhook can attribute the
  // server-side Purchase. The webhook itself fires from Stripe's servers and can't
  // see any of this. IP/UA come from the request headers; fbp/fbc from the pixel
  // cookies read browser-side and posted in the body.
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const capi = {
    fbp:       fbp || '',
    fbc:       fbc || '',
    client_ip: clientIp,
    client_ua: (req.headers['user-agent'] || '').slice(0, 500),
    src_url:   eventSourceUrl || '',
  };

  const session = await stripe.checkout.sessions.create({
    mode:                 'subscription',
    line_items:           lineItems,
    allow_promotion_codes: true,
    ...(email ? { customer_email: email } : {}),
    metadata:             { ...metadata, ...capi },
    subscription_data:    { metadata },
    success_url:          `https://passport.prive-padel.com/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `https://prive-padel.com/join`,
  });

  return res.status(200).json({ url: session.url });
}
