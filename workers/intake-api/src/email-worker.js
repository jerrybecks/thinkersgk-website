/**
 * Incoming Email Handler — Cloudflare Email Worker
 *
 * Receives emails sent to @thinkersgk.com, parses them,
 * stores in KV so agents can read and reply.
 *
 * Storage format in KV:
 *   Key: inbox:{to-address}:{timestamp}:{id}
 *   Value: { id, from, to, subject, date, body, headers, isRead }
 *   TTL: 90 days
 */

/**
 * Handle incoming email event from Cloudflare Email Routing
 */
export async function emailHandler(message, env) {
  const { from, to } = message;

  try {
    // Read raw email content
    const rawEmail = await streamToText(message.raw);

    // Parse email
    const parsed = parseEmail(rawEmail, from, to);

    // Store in KV
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const toLocal = to.split('@')[0] || 'info';
    const key = `inbox:${toLocal}:${timestamp}:${id}`;

    await env.SUBMISSIONS.put(key, JSON.stringify({
      id,
      from: parsed.from || from,
      to,
      toLocal,
      subject: parsed.subject || '(no subject)',
      date: timestamp,
      body: parsed.body.slice(0, 10000),
      bodyHtml: parsed.bodyHtml ? parsed.bodyHtml.slice(0, 20000) : null,
      headers: parsed.headers,
      isRead: false,
      isReply: /^Re:/i.test(parsed.subject || ''),
    }), {
      expirationTtl: 90 * 24 * 60 * 60, // 90 days
    });

    console.log(`[email-in] Stored: ${from} → ${to} "${parsed.subject}" (${key})`);

    // Also forward to the destination (Gmail) so nothing is lost
    await message.forward(env.FORWARD_TO || 'thinkerstars@gmail.com');

  } catch (err) {
    console.error('[email-in] Processing failed:', err);
    // Still forward even if processing fails
    try {
      await message.forward(env.FORWARD_TO || 'thinkerstars@gmail.com');
    } catch (fwdErr) {
      console.error('[email-in] Forward also failed:', fwdErr);
      message.setReject('Processing error');
    }
  }
}

/**
 * API: List inbox for an agent/address
 * GET /api/inbox?account=alex&limit=20
 */
export async function handleInboxList(request, env) {
  const url = new URL(request.url);
  const account = url.searchParams.get('account') || 'info';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const origin = request.headers.get('Origin') || '';
  const wantPreview = url.searchParams.get('preview') === 'true';

  // Use KV list() with metadata — ONE operation, no individual gets needed
  // KV list returns keys sorted newest-last, so we just reverse
  const prefix = `inbox:${account}:`;
  const list = await env.SUBMISSIONS.list({ prefix, limit: 1000 });
  const sortedKeys = list.keys
    .slice()
    .sort((a, b) => (b.name || '').localeCompare(a.name || ''));

  // Parse email info directly from the key name (inbox:account:timestamp:id)
  // Only do individual get() if the caller asks for previews via ?preview=true
  const emails = [];

  if (wantPreview) {
    // Fetch previews for the newest N items (limit to control KV reads)
    const previewCount = Math.min(limit, 10);
    for (const item of sortedKeys.slice(0, previewCount)) {
      const data = await env.SUBMISSIONS.get(item.name, 'json');
      if (data) {
        emails.push({
          id: data.id, key: item.name, from: data.from, to: data.to,
          subject: data.subject, date: data.date,
          preview: (data.body || '').slice(0, 200),
          isRead: data.isRead, isReply: data.isReply,
        });
      }
    }
  } else {
    // Fast mode: extract metadata from key names only (ZERO extra KV reads)
    for (const item of sortedKeys.slice(0, limit)) {
      const parts = item.name.split(':');
      // Key format: inbox:{account}:{timestamp}:{uuid}
      emails.push({
        key: item.name,
        id: parts[3] || '',
        date: parts[2] || '',
        account: parts[1] || account,
        // These fields require a get() — caller uses /api/inbox/read for full data
        from: null, to: null, subject: null, preview: null,
        isRead: null, isReply: null,
      });
    }
  }

  // Sort newest first
  emails.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return new Response(JSON.stringify({
    account,
    count: emails.length,
    emails: emails.slice(0, limit),
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Cache-Control': 'public, max-age=60', // Cache for 60s — reduces repeated hits
    },
  });
}

/**
 * API: Read a specific email
 * GET /api/inbox/read?key=inbox:alex:2026-03-11:uuid
 */
export async function handleInboxRead(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const origin = request.headers.get('Origin') || '';

  if (!key) {
    return new Response(JSON.stringify({ error: 'key parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await env.SUBMISSIONS.get(key, 'json');
  if (!data) {
    return new Response(JSON.stringify({ error: 'Email not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Mark as read
  if (!data.isRead) {
    data.isRead = true;
    await env.SUBMISSIONS.put(key, JSON.stringify(data), {
      expirationTtl: 90 * 24 * 60 * 60,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Cache-Control': 'public, max-age=300', // Cache 5min — email content doesn't change
    },
  });
}

// ── Helpers ──────────────────────────────────

async function streamToText(readableStream) {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

function parseEmail(raw, fallbackFrom, fallbackTo) {
  const headers = {};
  let body = '';
  let bodyHtml = null;

  // Split headers from body
  const headerEnd = raw.indexOf('\r\n\r\n');
  const headerSection = headerEnd > 0 ? raw.slice(0, headerEnd) : raw.slice(0, 2000);
  const bodySection = headerEnd > 0 ? raw.slice(headerEnd + 4) : '';

  // Parse key headers
  const headerLines = headerSection.replace(/\r\n\s+/g, ' ').split('\r\n');
  for (const line of headerLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const name = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      headers[name] = value;
    }
  }

  // Handle MIME multipart
  const contentType = headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);

  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = bodySection.split('--' + boundary);
    for (const part of parts) {
      const partHeaderEnd = part.indexOf('\r\n\r\n');
      if (partHeaderEnd < 0) continue;
      const partHeaders = part.slice(0, partHeaderEnd).toLowerCase();
      let partBody = part.slice(partHeaderEnd + 4).replace(/--$/, '').trim();

      // Decode based on Content-Transfer-Encoding
      if (partHeaders.includes('base64')) {
        partBody = decodeBase64Utf8(partBody.replace(/\s/g, ''));
      } else if (partHeaders.includes('quoted-printable')) {
        partBody = decodeQuotedPrintable(partBody);
      }

      if (partHeaders.includes('text/plain') && !body) {
        body = partBody;
      } else if (partHeaders.includes('text/html') && !bodyHtml) {
        bodyHtml = partBody;
      }
    }
  }

  // If no multipart, use body as-is
  if (!body && bodySection) {
    let decoded = bodySection;
    const transferEncoding = (headers['content-transfer-encoding'] || '').toLowerCase();
    if (transferEncoding.includes('base64')) {
      decoded = decodeBase64Utf8(decoded.replace(/\s/g, ''));
    } else if (transferEncoding.includes('quoted-printable')) {
      decoded = decodeQuotedPrintable(decoded);
    }

    if (contentType.includes('text/html')) {
      bodyHtml = decoded;
      body = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      body = decoded;
    }
  }

  return {
    from: headers['from'] || fallbackFrom,
    to: headers['to'] || fallbackTo,
    subject: decodeHeader(headers['subject'] || ''),
    date: headers['date'] || new Date().toISOString(),
    body,
    bodyHtml,
    headers: {
      messageId: headers['message-id'],
      inReplyTo: headers['in-reply-to'],
      references: headers['references'],
    },
  };
}

function decodeQuotedPrintable(str) {
  // Remove soft line breaks, then decode hex pairs to raw bytes
  const cleaned = str.replace(/=\r?\n/g, '');
  const bytes = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '=' && i + 2 < cleaned.length && /[0-9A-Fa-f]{2}/.test(cleaned.slice(i + 1, i + 3))) {
      bytes.push(parseInt(cleaned.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(cleaned.charCodeAt(i));
    }
  }
  // Decode the byte array as UTF-8
  return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
}

function decodeBase64Utf8(b64) {
  // Decode base64 to bytes, then interpret as UTF-8
  const binaryStr = atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function decodeHeader(str) {
  // Handle RFC 2047 encoded headers (=?UTF-8?B?...?= or =?UTF-8?Q?...?=)
  return str.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (_, charset, encoding, value) => {
    if (encoding.toUpperCase() === 'B') {
      return decodeBase64Utf8(value);
    }
    return decodeQuotedPrintable(value.replace(/_/g, ' '));
  });
}
