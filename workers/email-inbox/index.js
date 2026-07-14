/**
 * Cloudflare Worker — Thinkers GK Email Inbox
 *
 * KV cost optimisations (2026-05-04):
 *   • /ping — zero-KV health check; hub probes should use this, not /api/inbox
 *   • Envelopes stored with KV metadata → /api/inbox list costs 1 LIST, 0 GETs
 *   • Raw email TTL reduced 30 d → 7 d
 *
 * Routes:
 *   GET  /ping                  → { ok: true } — zero KV ops
 *   GET  /api/inbox             → list recent envelopes (metadata only, 1 LIST op)
 *   GET  /api/inbox/read?key=X  → full raw email (2 GET ops: raw + env)
 *   POST /api/resend-webhook    → Resend delivery events
 *   GET  /api/delivery?id=X     → delivery status lookup
 *
 * KV namespace binding: INBOX_KV
 */

const RAW_TTL  = 60 * 60 * 24 * 7;  // 7 days  (was 30)
const ENV_TTL  = 60 * 60 * 24 * 30; // 30 days  (envelopes kept longer for index)
const LIST_CACHE_TTL = 5 * 60;
const ALLOWED_ORIGINS = new Set([
  'https://thinkersgk.com',
  'https://www.thinkersgk.com',
  'https://hub.thinkersgk.com',
]);

export default {
  // ── Incoming email handler ────────────────────────────────────────────────
  async email(messageOrEvent, env, ctx) {
    const msg = messageOrEvent?.message || messageOrEvent;
    if (!msg?.raw) throw new Error('Email event missing raw message stream');

    const { rawText, totalBytes, rawTruncated } = await readRawText(msg.raw);
    const headers = parseHeaders(rawText);
    const to      = normalizeAddress(msg.to || getHeader(headers, 'to'));
    const account = getLocalPart(to);
    const msgId   = getHeader(headers, 'message-id');

    const key = `${account}:${makeMessageKey()}`;
    const envelope = {
      key,
      account,
      from:         normalizeAddress(msg.from || getHeader(headers, 'from')),
      to,
      toLocal:      account,
      subject:      getHeader(headers, 'subject'),
      date:         getHeader(headers, 'date') || new Date().toISOString(),
      receivedAt:   new Date().toISOString(),
      sizeBytes:    totalBytes,
      messageId:    msgId,
      rawTruncated,
    };

    // Metadata stored alongside the key so /api/inbox list needs 0 extra GETs.
    // KV metadata limit is 1024 bytes; we keep only fields needed for the inbox list.
    const meta = {
      from:       String(envelope.from    || '').slice(0, 200),
      subject:    String(envelope.subject || '').slice(0, 200),
      date:       envelope.date,
      receivedAt: envelope.receivedAt,
      account:    envelope.account,
      sizeBytes:  envelope.sizeBytes,
      rawTruncated: envelope.rawTruncated,
      messageId:  String(envelope.messageId || '').slice(0, 100),
      to:         String(envelope.to || '').slice(0, 100),
    };

    await Promise.all([
      // Raw body: short TTL to save storage
      env.INBOX_KV.put(`raw:${key}`, rawText, { expirationTtl: RAW_TTL }),
      // Envelope JSON: longer TTL, also stored in metadata for free listing
      env.INBOX_KV.put(`env:${key}`, JSON.stringify(envelope), {
        expirationTtl: ENV_TTL,
        metadata: meta,
      }),
    ]);
  },

  // ── HTTP handler ──────────────────────────────────────────────────────────
  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname;

    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';
    const corsHeaders = {
      ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin, 'Vary': 'Origin' } : {}),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Inbox-Token',
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    };

    if (request.method === 'OPTIONS') {
      if (origin && !allowedOrigin) return new Response(null, { status: 403, headers: corsHeaders });
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── GET /ping — zero-KV health check ─────────────────────────────────────
    if (path === '/ping') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), { headers: corsHeaders });
    }

    // Auth gate for protected routes
    const apiToken = (env.INBOX_API_TOKEN || '').trim();
    const requiresAuth = path === '/api/inbox' || path === '/api/inbox/read' || path === '/api/delivery';
    if (requiresAuth && !apiToken) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503, headers: corsHeaders });
    }
    let presentedToken = '';
    if (requiresAuth) {
      presentedToken = readBearerToken(request) || request.headers.get('x-inbox-token') || '';
      if (!timingSafeEqual(String(presentedToken).trim(), apiToken)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      }
    }

    // ── GET /api/inbox — list envelopes (1 LIST op, 0 GETs via metadata) ─────
    if (path === '/api/inbox' && request.method === 'GET') {
      try {
        const parsedLimit = Number.parseInt(url.searchParams.get('limit') || '20', 10);
        const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 100)) : 20;
        const account = (url.searchParams.get('account') || '').trim().toLowerCase();
        if (account && !/^[a-z0-9_-]{1,64}$/.test(account)) {
          return new Response(JSON.stringify({ error: 'Invalid account' }), { status: 400, headers: corsHeaders });
        }
        const cacheKey = await inboxListCacheKey(url, account, limit, presentedToken);
        const cache = caches.default;
        const cached = await cache.match(cacheKey);
        if (cached) {
          const body = await cached.text();
          return new Response(body, { headers: { ...corsHeaders, 'X-KV-Cache': 'HIT' } });
        }
        const prefix  = account ? `env:${account}:` : 'env:';
        const envelopes = await listEnvelopes(env.INBOX_KV, prefix, limit);
        const body = JSON.stringify({ messages: envelopes, total: envelopes.length });
        ctx.waitUntil(cache.put(cacheKey, new Response(body, {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${LIST_CACHE_TTL}` },
        })));
        return new Response(body, { headers: { ...corsHeaders, 'X-KV-Cache': 'MISS' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // ── GET /api/inbox/read?key=X — full raw email (2 GET ops) ───────────────
    if (path === '/api/inbox/read' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key) return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: corsHeaders });
      if (!/^[a-z0-9_-]{1,64}:[0-9]{13}_[a-z0-9]{6}$/i.test(key)) {
        return new Response(JSON.stringify({ error: 'Invalid key' }), { status: 400, headers: corsHeaders });
      }
      try {
        const [raw, envJson] = await Promise.all([
          env.INBOX_KV.get(`raw:${key}`),
          env.INBOX_KV.get(`env:${key}`),
        ]);
        if (!raw && !envJson) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
        const envelope = envJson ? JSON.parse(envJson) : {};
        return new Response(JSON.stringify({
          envelope,
          raw:      raw || '',
          from:     envelope.from      || '',
          to:       envelope.to        || '',
          subject:  envelope.subject   || '',
          date:     envelope.date      || envelope.receivedAt || '',
          body:     raw || '',
          bodyHtml: '',
        }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // ── POST /api/resend-webhook — Resend delivery events ────────────────────
    if (path === '/api/resend-webhook' && request.method === 'POST') {
      try {
        const body   = await request.text();
        const secret = env.RESEND_WEBHOOK_SECRET;
        if (secret) {
          const sig = request.headers.get('svix-signature') || '';
          const ts  = request.headers.get('svix-timestamp') || '';
          const id  = request.headers.get('svix-id')        || '';
          if (Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) {
            return new Response(JSON.stringify({ error: 'Timestamp too old' }), { status: 401, headers: corsHeaders });
          }
          const msgToSign = `${id}.${ts}.${body}`;
          const importedKey = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
          );
          const sigBytes = Uint8Array.from(
            atob(sig.split(',').find(s => s.startsWith('v1,'))?.slice(3) || ''),
            c => c.charCodeAt(0)
          );
          const valid = await crypto.subtle.verify('HMAC', importedKey, sigBytes, new TextEncoder().encode(msgToSign));
          if (!valid) return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: corsHeaders });
        } else if (apiToken) {
          const presented = readBearerToken(request) || request.headers.get('x-inbox-token') || '';
          if (String(presented).trim() !== apiToken) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
          }
        }
        const event   = JSON.parse(body);
        const type    = event.type || 'unknown';
        const emailId = event.data?.email_id || event.data?.id || 'unknown';
        await env.INBOX_KV.put(`delivery:${emailId}`, JSON.stringify({
          emailId, type,
          to:         event.data?.to,
          subject:    event.data?.subject,
          createdAt:  event.data?.created_at || new Date().toISOString(),
          recordedAt: new Date().toISOString(),
        }), { expirationTtl: 60 * 60 * 24 * 7 });
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // ── GET /api/delivery?id=X ────────────────────────────────────────────────
    if (path === '/api/delivery' && request.method === 'GET') {
      const emailId = url.searchParams.get('id');
      if (!emailId) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: corsHeaders });
      try {
        const val = await env.INBOX_KV.get(`delivery:${emailId}`);
        if (!val) return new Response(JSON.stringify({ status: 'unknown' }), { headers: corsHeaders });
        return new Response(val, { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_RAW_BYTES = 20_000_000;

/**
 * List envelopes using KV metadata — costs exactly 1 LIST op, 0 GET ops.
 * Falls back to a GET for any key written before metadata was added.
 */
async function listEnvelopes(kv, prefix, limit) {
  const page = await kv.list({ prefix, limit, metadata: true });
  const envelopes = [];
  const fallbackKeys = [];

  for (const key of page.keys) {
    if (key.metadata && Object.keys(key.metadata).length > 0) {
      envelopes.push({ key: key.name.replace(/^env:/, ''), ...key.metadata });
    } else {
      fallbackKeys.push(key.name);
    }
  }

  // Only fetch GET for legacy keys (no metadata) — will be zero once all new
  if (fallbackKeys.length) {
    const fetched = await Promise.all(fallbackKeys.map(async name => {
      const raw = await kv.get(name);
      return raw ? JSON.parse(raw) : null;
    }));
    envelopes.push(...fetched.filter(Boolean));
  }

  // Sort newest first (key encodes inverted timestamp)
  envelopes.sort((a, b) => String(a.key || '').localeCompare(String(b.key || '')));
  return envelopes.slice(0, limit);
}

function readBearerToken(request) {
  const h = request.headers.get('authorization') || '';
  const m = h.match(/^\s*Bearer\s+(.+)\s*$/i);
  return m ? m[1].trim() : '';
}

function timingSafeEqual(left, right) {
  const a = new TextEncoder().encode(String(left));
  const b = new TextEncoder().encode(String(right));
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function inboxListCacheKey(url, account, limit, token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = [...new Uint8Array(digest)].slice(0, 12).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const keyUrl = new URL('/__cache/inbox-list', url.origin);
  keyUrl.searchParams.set('account', account || 'all');
  keyUrl.searchParams.set('limit', String(limit));
  keyUrl.searchParams.set('auth', tokenHash);
  return new Request(keyUrl.toString(), { method: 'GET' });
}

function makeMessageKey() {
  const invertedTs = String(9999999999999 - Date.now()).padStart(13, '0');
  const rand = Math.random().toString(36).slice(2, 8);
  return `${invertedTs}_${rand}`;
}

function normalizeAddress(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(normalizeAddress).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const name    = typeof value.name    === 'string' ? value.name.trim()    : '';
    const address = typeof value.address === 'string' ? value.address.trim() : '';
    if (name && address) return `${name} <${address}>`;
    if (address) return address;
  }
  return String(value).trim();
}

function getLocalPart(address) {
  const match = normalizeAddress(address).match(/([A-Z0-9._%+-]+)@/i);
  return match ? match[1].toLowerCase() : 'unknown';
}

function parseHeaders(rawText) {
  const headerEnd  = rawText.indexOf('\r\n\r\n');
  const fallback   = rawText.indexOf('\n\n');
  const end        = headerEnd > -1 ? headerEnd : fallback;
  const section    = end > -1 ? rawText.slice(0, end) : rawText.slice(0, 2000);
  const unfolded   = section.replace(/\r?\n[ \t]+/g, ' ');
  const headers    = new Map();
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const name  = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (name && !headers.has(name)) headers.set(name, value);
  }
  return headers;
}

function getHeader(headers, name) {
  return headers.get(name.toLowerCase()) || '';
}

async function readRawText(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let totalBytes  = 0;
  let rawTruncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    const remaining = MAX_RAW_BYTES - totalBytes;
    if (remaining <= 0) { rawTruncated = true; break; }
    if (value.byteLength > remaining) {
      chunks.push(value.slice(0, remaining));
      totalBytes += remaining;
      rawTruncated = true;
      break;
    }
    chunks.push(value);
    totalBytes += value.byteLength;
  }

  if (rawTruncated) await reader.cancel().catch(() => {});

  const rawBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) { rawBytes.set(chunk, offset); offset += chunk.byteLength; }

  return {
    rawText: new TextDecoder('utf-8', { fatal: false }).decode(rawBytes),
    totalBytes,
    rawTruncated,
  };
}
