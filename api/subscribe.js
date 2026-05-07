export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, firstName, source } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const profileAttributes = { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } };
  if (firstName) profileAttributes.first_name = firstName;

  const klaviyoRes = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      'revision': '2024-10-15',
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          custom_source: source || 'website',
          profiles: {
            data: [{ type: 'profile', attributes: profileAttributes }]
          }
        },
        relationships: {
          list: { data: { type: 'list', id: process.env.KLAVIYO_LIST_ID } }
        }
      }
    })
  });

  if (klaviyoRes.status === 202) return res.status(200).json({ ok: true });

  const err = await klaviyoRes.text();
  console.error('Klaviyo error:', klaviyoRes.status, err);
  return res.status(500).json({ error: 'Subscription failed' });
}
