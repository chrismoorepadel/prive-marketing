export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, firstName, source, tier, value, retreat } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const profileAttributes = { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } };

  // Route each capture source to its own Klaviyo list; fall back to the default
  // list if that source's list isn't configured yet.
  const LIST_BY_SOURCE = {
    founding_offer: process.env.KLAVIYO_FOUNDING_LIST_ID,
    join_checkout:  process.env.KLAVIYO_JOIN_LIST_ID,
  };
  const listId = LIST_BY_SOURCE[source] || process.env.KLAVIYO_LIST_ID;

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
          list: { data: { type: 'list', id: listId } }
        }
      }
    })
  });

  if (klaviyoRes.status !== 202) {
    const err = await klaviyoRes.text();
    console.error('Klaviyo error:', klaviyoRes.status, err);
    return res.status(500).json({ error: 'Subscription failed' });
  }

  // Track a "Started Checkout" event so Klaviyo can drive an abandoned-checkout
  // flow. The flow triggers on this event and filters out anyone who later fires
  // "Placed Order" (see api/webhook.js) — so converters never get the reminder.
  await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
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
          metric:  { data: { type: 'metric', attributes: { name: 'Started Checkout' } } },
          profile: { data: { type: 'profile', attributes: { email, ...(firstName ? { first_name: firstName } : {}) } } },
          properties: {
            source: source || 'website',
            ...(tier ? { tier } : {}),
            // Set when they came from a retreat page. Lets a flow segment on
            // who joined for which retreat, and tells whoever follows up what
            // the member is actually waiting to book.
            ...(retreat ? { retreat } : {}),
          },
          ...(value ? { value: Number(value) } : {}),
        }
      }
    })
  }).catch(() => {});

  if (firstName) {
    await fetch('https://a.klaviyo.com/api/profile-import/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: { type: 'profile', attributes: { email, first_name: firstName } }
      })
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
