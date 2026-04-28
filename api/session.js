import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || !process.env.STRIPE_SECRET_KEY) {
    return res.status(400).json({ error: 'Missing session id or configuration' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ['customer'],
  });

  const name = session.customer?.name || session.customer_details?.name || '';
  const firstName = name.split(' ')[0] || '';

  return res.status(200).json({ firstName });
}
