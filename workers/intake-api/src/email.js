/**
 * Email Sending Module — Resend API integration
 *
 * Free tier: 100 emails/day, 3,000/month
 * Supports sending as any @thinkersgk.com address with proper DKIM/SPF
 *
 * Required secrets:
 *   RESEND_API_KEY — from resend.com dashboard
 *
 * Agent addresses:
 *   info@thinkersgk.com, jeff@thinkersgk.com, alex@thinkersgk.com,
 *   maya@thinkersgk.com, kenji@thinkersgk.com, yuki@thinkersgk.com,
 *   hana@thinkersgk.com
 */

const AGENT_ADDRESSES = {
  info: { email: 'info@thinkersgk.com', name: 'Thinkers GK' },
  support: { email: 'support@thinkersgk.com', name: 'Thinkers GK Support' },
  jeff: { email: 'jeff@thinkersgk.com', name: 'Jeff — Thinkers GK' },
  alex: { email: 'alex@thinkersgk.com', name: 'Alex Sunshine — Thinkers GK' },
  maya: { email: 'maya@thinkersgk.com', name: 'Maya — Thinkers GK' },
  kenji: { email: 'kenji@thinkersgk.com', name: 'Kenji — Thinkers GK' },
  yuki: { email: 'yuki@thinkersgk.com', name: 'Yuki — Thinkers GK' },
  hana: { email: 'hana@thinkersgk.com', name: 'Hana — Thinkers GK' },
};

/**
 * Build professional HTML email signature block.
 * Uses tables + inline CSS for maximum email client compatibility.
 */
function buildSignature(senderName, senderTitle) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
  <!-- Signature separator -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="max-width:560px;">
    <tr><td style="padding:24px 0 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="border-top:2px solid #1e3a6e;font-size:1px;line-height:1px;">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
  <!-- Signature content -->
  <table cellpadding="0" cellspacing="0" border="0" align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#333;line-height:1.4;max-width:560px;padding-top:14px;">
    <tr>
      <td style="vertical-align:top;padding-right:12px;width:120px;">
        <img src="https://www.thinkersgk.com/assets/email-logo.png" alt="Thinkers GK" width="110" height="80" style="display:block;border:0;outline:none;" />
      </td>
      <td style="vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td>
            <strong style="font-size:13px;color:#1e3a6e;">${esc(senderName)}</strong>
          </td></tr>
          <tr><td style="padding-top:1px;">
            <span style="font-size:11px;color:#555;">${esc(senderTitle)}</span>
          </td></tr>
          <tr><td style="padding-top:8px;">
            <strong style="font-size:11px;color:#1e3a6e;">Thinkers GK</strong>
            <span style="font-size:11px;color:#888;">（合同会社 Thinkers）</span>
          </td></tr>
          <tr><td style="padding-top:1px;font-size:11px;color:#555;">
            IT Services &amp; Technical Staffing
          </td></tr>
          <tr><td style="font-size:11px;color:#555;">
            Tokyo &amp; Nationwide Japan
          </td></tr>
          <tr><td style="padding-top:8px;">
            <a href="https://www.thinkersgk.com" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">www.thinkersgk.com</a>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>`;
}

const SENDER_TITLES = {
  info: 'General Inquiries',
  support: 'Support',
  jeff: 'Managing Director',
  alex: 'Sales & Business Development',
  maya: 'Client Relations',
  kenji: 'Technical Lead',
  yuki: 'Project Coordinator',
  hana: 'Operations',
};

/**
 * Send an email via Resend API
 *
 * @param {Object} env - Worker environment bindings
 * @param {Object} options
 * @param {string} options.from - Agent key (e.g., 'alex', 'info')
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (plain text — will be wrapped in HTML)
 * @param {string} [options.replyTo] - Reply-to address
 * @param {string} [options.cc] - CC address
 * @returns {Object} { success, id, error }
 */
export async function sendEmail(env, { from, to, subject, body, replyTo, cc }) {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: 'Email sending not configured (missing RESEND_API_KEY)' };
  }

  const agent = AGENT_ADDRESSES[from] || AGENT_ADDRESSES.info;
  const title = SENDER_TITLES[from] || '';
  const senderName = agent.name.split(' — ')[0] || agent.name;

  // Build professional HTML email
  const htmlBody = buildHtmlEmail(body, senderName, title);

  const payload = {
    from: `${agent.name} <${agent.email}>`,
    to: [to],
    subject,
    html: htmlBody,
    text: `${body}\n\n---\n${senderName}\n${title}\nThinkers GK（合同会社 Thinkers）\nIT Services & Technical Staffing\nTokyo & Nationwide Japan\nhttps://www.thinkersgk.com`,
  };

  if (replyTo) payload.reply_to = replyTo;
  if (cc) payload.cc = [cc];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', res.status, JSON.stringify(result));
      return { success: false, error: result.message || `Resend API returned ${res.status}` };
    }

    // Log to KV for audit trail
    try {
      const auditKey = `email:sent:${new Date().toISOString()}:${result.id}`;
      await env.SUBMISSIONS.put(auditKey, JSON.stringify({
        id: result.id,
        from: agent.email,
        to,
        subject,
        sent_at: new Date().toISOString(),
        agent: from,
      }), { expirationTtl: 90 * 24 * 60 * 60 });
    } catch (err) {
      console.error('Failed to log email to KV:', err);
    }

    return { success: true, id: result.id };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Handle POST /api/email/send — API endpoint for sending emails
 * Used by the Command Center agents
 */
export async function handleSendEmail(request, env) {
  const origin = request.headers.get('Origin') || '';

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResp({ success: false, error: 'Invalid JSON' }, 400, origin);
  }

  const { from, to, subject, body, reply_to, cc, council_approved } = data;

  if (!to || !subject || !body) {
    return jsonResp({ success: false, error: 'to, subject, and body are required' }, 400, origin);
  }

  if (!council_approved) {
    return jsonResp({ success: false, error: 'Email must be approved by the Council Chamber' }, 403, origin);
  }

  const result = await sendEmail(env, {
    from: from || 'info',
    to,
    subject,
    body,
    replyTo: reply_to,
    cc,
  });

  return jsonResp(result, result.success ? 200 : 500, origin);
}

/**
 * Handle GET /api/email/audit — List sent emails for audit trail
 */
export async function handleEmailAudit(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key || key !== env.ADMIN_KEY) {
    return jsonResp({ error: 'Unauthorized' }, 401);
  }

  const list = await env.SUBMISSIONS.list({ prefix: 'email:sent:', limit: 50 });
  const emails = [];
  for (const item of list.keys) {
    const data = await env.SUBMISSIONS.get(item.name, 'json');
    if (data) emails.push(data);
  }

  emails.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  return jsonResp({ count: emails.length, emails });
}

function jsonResp(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Build complete HTML email with body content and professional signature.
 * Compatible with Gmail, Outlook, Zoho, Apple Mail, Yahoo.
 */
function buildHtmlEmail(plainBody, senderName, senderTitle) {
  const bodyParagraphs = plainBody.split('\n').map(line =>
    line.trim()
      ? `<p style="margin:0 0 14px 0;font-size:15px;color:#222;line-height:1.7;">${escapeHtml(line)}</p>`
      : ''
  ).filter(Boolean).join('\n        ');

  const signature = buildSignature(senderName, senderTitle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email from ${escapeHtml(senderName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <!-- Outer wrapper for background color -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f5f5;">
    <tr><td align="center" style="padding:24px 16px;">
      <!-- Inner content card -->
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Body content -->
        <tr><td style="padding:32px 32px 16px 32px;">
          ${bodyParagraphs}
        </td></tr>
        <!-- Signature -->
        <tr><td style="padding:0 32px 32px 16px;">
          ${signature}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
