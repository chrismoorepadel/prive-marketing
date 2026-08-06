// ─── RETREAT BOOKING ENQUIRY ──────────────────────────────────
// Receives the booking lightbox on the retreat pages and does what
// the prive-passport /api/retreat-inquiry route does: notifies the
// team, confirms to the guest, and logs the enquiry.
//
// Resend is called over REST rather than through its SDK, the same
// way api/subscribe.js calls Klaviyo — this repo installs no packages
// beyond stripe, and there's no reason to start for two POSTs.

const RETREATS = {
  'voaara-madagascar': 'Voaara Madagascar',
  'court-and-cellar':  'Château de Lussac',
  'nihi-sumba':        'Nihi Sumba',
};

const FROM     = process.env.RESEND_FROM || 'Privé Padel <inquiries@privepassport.com>';
const TEAM     = 'chris@prive-padel.com';
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

// Everything below is visitor-supplied and lands in an HTML email.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ESC[c]);

function notificationHtml(d) {
  const rows = [
    ['Guest',           `${d.firstName} ${d.lastName}`],
    ['Email',           d.email],
    ['Phone',           d.phone || '—'],
    ['Party size',      d.party],
    ['Preferred dates', d.date],
    ['Message',         d.message || '—'],
  ].map(([k, v]) => `
    <tr><td style="font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.45);padding:10px 0 2px;">${esc(k)}</td></tr>
    <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;color:rgba(255,255,255,.9);padding:0 0 14px;border-bottom:1px solid rgba(255,255,255,.07);">${esc(v)}</td></tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1B2A4A;font-family:'Jost',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1B2A4A;"><tr><td align="center" style="padding:48px 20px;">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#243552;border-radius:4px;"><tr><td style="padding:48px;">
  <p style="margin:0 0 28px;text-align:center;"><img src="https://res.cloudinary.com/dfjqa5f05/image/upload/v1773187743/logo_light_o5mgdz.png" alt="Privé Padel" width="140" style="width:140px;height:auto;border:0;"></p>
  <p style="font-size:10px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#B8976A;margin:0 0 8px;text-align:center;">New booking enquiry</p>
  <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:300;font-style:italic;color:#fff;margin:0 0 32px;text-align:center;">${esc(d.retreatName)}</h1>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(184,151,106,.3);">${rows}</table>
  <p style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:28px 0 0;text-align:center;">Privé Padel · Retreat enquiries</p>
</td></tr></table></td></tr></table></body></html>`;
}

function confirmationHtml(d) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Jost',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0E8;"><tr><td align="center" style="padding:48px 20px;">
<table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:#fff;"><tr><td style="padding:56px 48px 48px;">
  <p style="margin:0 0 32px;text-align:center;"><img src="https://res.cloudinary.com/dfjqa5f05/image/upload/v1773187743/logo_dark_drvkxb.png" alt="Privé Padel" width="160" style="width:160px;height:auto;border:0;"></p>
  <p style="font-size:10px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#B8976A;margin:0 0 20px;text-align:center;">Privé Padel</p>
  <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:300;font-style:italic;color:#1B2A4A;margin:0 0 12px;text-align:center;">Your enquiry.</h1>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:#1B2A4A;opacity:.7;margin:0 0 36px;text-align:center;">${esc(d.retreatName)}</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 36px;"><tr><td align="center"><div style="width:36px;height:1px;background:#B8976A;">&nbsp;</div></td></tr></table>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.65;margin:0 0 20px;">Dear ${esc(d.firstName)},</p>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.65;margin:0 0 20px;">We've received your enquiry for <strong>${esc(d.retreatName)}</strong>. A member of the Privé team will be in touch shortly to confirm your place and answer any questions.</p>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.65;margin:0 0 8px;"><strong>Preferred dates:</strong> ${esc(d.date)}<br><strong>Party size:</strong> ${esc(d.party)}</p>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:#1B2A4A;line-height:1.65;margin:20px 0 36px;">Reply to this email with any questions in the meantime.</p>
  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-style:italic;color:#1B2A4A;margin:0 0 48px;">— Privé Padel</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E5E0D8;padding-top:24px;">
    <p style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#9A8C78;margin:0;text-align:center;">Privé Padel · <a href="https://prive-padel.com" style="color:#B8976A;text-decoration:none;">prive-padel.com</a></p>
  </td></tr></table>
</td></tr></table></td></tr></table></body></html>`;
}

function sendEmail(payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return r.json();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { retreat, firstName, lastName, email, phone, party, date, message } = req.body || {};

  const retreatName = RETREATS[String(retreat || '').toLowerCase()];
  if (!retreatName) return res.status(400).json({ error: 'Unknown retreat' });
  if (!firstName || !lastName) return res.status(400).json({ error: 'Name required' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const d = {
    retreatName,
    firstName: String(firstName).slice(0, 80),
    lastName:  String(lastName).slice(0, 80),
    email:     String(email).slice(0, 200),
    phone:     String(phone   || '').slice(0, 40),
    party:     String(party   || '').slice(0, 40),
    date:      String(date    || '').slice(0, 120),
    message:   String(message || '').slice(0, 2000),
  };

  try {
    // The notification is the one that must land — if Resend rejects it the
    // visitor is told, rather than being thanked for an enquiry nobody got.
    await sendEmail({
      from: FROM,
      to: [TEAM],
      reply_to: d.email,
      subject: `Retreat booking enquiry — ${retreatName} · ${d.firstName} ${d.lastName}`,
      html: notificationHtml(d),
    });
  } catch (err) {
    console.error('Retreat enquiry — notification failed:', err);
    return res.status(500).json({ error: 'Could not send enquiry' });
  }

  // Courtesy copy to the guest. A failure here doesn't lose the enquiry,
  // so it must not fail the request.
  sendEmail({
    from: FROM,
    to: [d.email],
    reply_to: TEAM,
    subject: `Privé Padel — ${retreatName} enquiry received`,
    html: confirmationHtml(d),
  }).catch((err) => console.error('Retreat enquiry — confirmation failed:', err));

  // Same Airtable log prive-passport keeps, when it's configured here too.
  if (process.env.AIRTABLE_BASE_ID && process.env.AIRTABLE_API_KEY) {
    fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Retreat%20Inquiries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'First Name': d.firstName,
          'Last Name':  d.lastName,
          'Email':      d.email,
          'Phone':      d.phone,
          'Retreat':    retreatName,
          'Preferred Dates': d.date,
          'Party Size': d.party,
          'Submitted At': new Date().toISOString(),
        },
      }),
    }).catch((err) => console.error('Retreat enquiry — Airtable log failed:', err));
  }

  return res.status(200).json({ ok: true });
}
