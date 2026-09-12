const MAX_LEN = 1000;

function clean(value, max = MAX_LEN) {
  return String(value ?? '').trim().slice(0, max);
}

function json(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const webhook = process.env.DISCORD_PARTNER_WEBHOOK;
  if (!webhook) return json(res, 500, { ok: false, error: 'Webhook not configured' });

  const body = req.body || {};
  const company = clean(body.company, 120);
  const contact = clean(body.contact, 120);
  const tier = clean(body.tier, 80);
  const supply = clean(body.supply, 1200);
  const reason = clean(body.reason, 1200);
  const note = clean(body.note, 1200) || 'Nincs megadva.';

  if (!company || !contact || !tier || !supply || !reason) {
    return json(res, 400, { ok: false, error: 'Missing required fields' });
  }

  const allowedTiers = new Set(['Standard Partner', 'Professional Partner', 'Corporate Partner']);
  if (!allowedTiers.has(tier)) {
    return json(res, 400, { ok: false, error: 'Invalid selection' });
  }

  const payload = {
    username: 'Kaito Website — Partner',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: '🤝 ÚJ WEBOLDALAS PARTNERI JELENTKEZÉS',
      color: 12653087,
      fields: [
        { name: '🏢 Cég neve', value: company, inline: true },
        { name: '👤 Kapcsolattartó / Discord név', value: contact, inline: true },
        { name: '🤝 Partneri szint', value: tier, inline: true },
        { name: '📦 Alkatrész / ellátási igény', value: supply, inline: false },
        { name: '💬 Csatlakozás indoka', value: reason, inline: false },
        { name: '📝 Egyéb megjegyzés', value: note, inline: false }
      ],
      footer: { text: 'Kaito Automotive Group • Website submission' },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const discordResponse = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discordResponse.ok) {
      console.error('Discord partner webhook failed:', discordResponse.status, await discordResponse.text());
      return json(res, 502, { ok: false, error: 'Discord delivery failed' });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Partner form error:', error);
    return json(res, 500, { ok: false, error: 'Server error' });
  }
}
