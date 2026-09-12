const MAX_LEN = 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateStore = globalThis.__kaitoRateStore || (globalThis.__kaitoRateStore = new Map());

function clean(value, max = MAX_LEN) {
  return String(value ?? '').trim().slice(0, max);
}

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req, bucketName) {
  const now = Date.now();
  const key = `${bucketName}:${clientIp(req)}`;
  const recent = (rateStore.get(key) || []).filter(ts => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateStore.set(key, recent);
    return true;
  }
  recent.push(now);
  rateStore.set(key, recent);
  return false;
}

function looksLikeBot(body) {
  if (clean(body.website, 200)) return true;
  const startedAt = Number(body._startedAt || 0);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true;
  const elapsed = Date.now() - startedAt;
  return elapsed < 1500 || elapsed > 2 * 60 * 60 * 1000;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const webhook = process.env.DISCORD_TUNING_WEBHOOK;
  if (!webhook) return json(res, 500, { ok: false, error: 'Webhook not configured' });

  const body = req.body || {};
  if (looksLikeBot(body)) return json(res, 400, { ok: false, error: 'Invalid submission' });
  if (isRateLimited(req, 'tuning')) return json(res, 429, { ok: false, error: 'Too many submissions' });

  const customer = clean(body.customer, 120);
  const phone = clean(body.phone, 80) || 'Nincs megadva.';
  const vehicle = clean(body.vehicle, 120);
  const value = clean(body.value, 80);
  const service = clean(body.service, 80);
  const importTuning = clean(body.import, 80);
  const idea = clean(body.idea, 1200);

  if (!customer || !vehicle || !value || !service || !importTuning || !idea) {
    return json(res, 400, { ok: false, error: 'Missing required fields' });
  }

  const allowedServices = new Set(['Verseny / Gyorsulás', 'Drift', 'Csak optika', 'Kaito Build']);
  const allowedImport = new Set(['Igen', 'Nem', 'Még nem tudom']);
  if (!allowedServices.has(service) || !allowedImport.has(importTuning)) {
    return json(res, 400, { ok: false, error: 'Invalid selection' });
  }

  const payload = {
    username: 'Kaito Website — Tuning',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: '🚗 ÚJ WEBOLDALAS TUNING AJÁNLATKÉRÉS',
      color: 12653087,
      fields: [
        { name: '👤 Ügyfél / Discord név', value: customer, inline: true },
        { name: '📞 Telefonszám', value: phone, inline: true },
        { name: '🚗 Jármű', value: vehicle, inline: true },
        { name: '💰 Jármű értéke', value, inline: true },
        { name: '🔧 Szolgáltatás', value: service, inline: true },
        { name: '📦 Import tuning', value: importTuning, inline: true },
        { name: '📝 Elképzelés / megjegyzés', value: idea, inline: false }
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
      console.error('Discord tuning webhook failed:', discordResponse.status, await discordResponse.text());
      return json(res, 502, { ok: false, error: 'Discord delivery failed' });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Tuning form error:', error);
    return json(res, 500, { ok: false, error: 'Server error' });
  }
}
