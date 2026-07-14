/**
 * Thinkers GK — Cloudflare Workers API
 *
 * Routes:
 *   POST /api/contact    — Contact form (store + AI qualify + notify)
 *   POST /api/intake     — Detailed AI-powered client intake
 *   POST /api/chat       — Real-time AI chat (streaming SSE)
 *   POST /api/chat/escalate — Escalate chat to human engineer
 *   POST /api/email/send  — Send email via Resend (Council-approved)
 *   GET  /api/email/audit — Email audit trail (admin only)
 *   GET  /api/health      — Health check
 *   GET  /api/submissions  — List recent submissions (admin only)
 *   GET  /api/inbox        — List incoming emails for an agent
 *   GET  /api/inbox/read   — Read a specific incoming email
 */

import { qualifyLead } from './ai-qualify.js';
import { handleChat, handleEscalate } from './chat.js';
import { handleSendEmail, handleEmailAudit } from './email.js';
import { emailHandler, handleInboxList, handleInboxRead } from './email-worker.js';

export default {
  // Handle incoming emails via Cloudflare Email Routing
  async email(message, env, ctx) {
    await emailHandler(message, env);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return handleCORS(env);
    }

    try {
      if (path === '/api/health' && request.method === 'GET') {
        const chatPrimaryProvider = String(env.AI_CHAT_PRIMARY_PROVIDER || 'gemini').toLowerCase();
        const geminiEnabled = !!env.GEMINI_API_KEY && env.GEMINI_ENABLED !== 'false';
        const workersEnabled = !!env.AI;
        return jsonResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: '3.1.0',
          ai: geminiEnabled || workersEnabled,
          ai_provider: geminiEnabled ? 'gemini-2.0-flash' : (workersEnabled ? 'workers-ai' : 'none'),
          chat_primary_provider: chatPrimaryProvider,
          providers: {
            gemini: geminiEnabled,
            workers_ai: workersEnabled
          }
        });
      }

      if (path === '/api/contact' && request.method === 'POST') {
        return await handleContact(request, env, ctx);
      }

      if (path === '/api/intake' && request.method === 'POST') {
        return await handleIntake(request, env, ctx);
      }

      if (path === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env);
      }

      if (path === '/api/chat/escalate' && request.method === 'POST') {
        return await handleEscalate(request, env);
      }

      if (path === '/api/email/send' && request.method === 'POST') {
        return await handleSendEmail(request, env);
      }

      if (path === '/api/email/audit' && request.method === 'GET') {
        return await handleEmailAudit(request, env);
      }

      // Incoming email inbox API
      if (path === '/api/inbox' && request.method === 'GET') {
        return await handleInboxList(request, env);
      }

      if (path === '/api/inbox/read' && request.method === 'GET') {
        return await handleInboxRead(request, env);
      }

      if (path === '/api/submissions' && request.method === 'GET') {
        return await handleListSubmissions(request, env);
      }
      if (path === '/api/resend/logs' && request.method === 'GET') {
        return await handleResendLogs(request, env);
      }
      if (path === '/api/resend/status' && request.method === 'GET') {
        return await handleResendStatus(request, env);
      }

      // AI proxy for Command Center agents (uses free Workers AI)
      if (path === '/api/ai/complete' && request.method === 'POST') {
        return await handleAIComplete(request, env);
      }

      return jsonResponse({ error: 'Not found' }, 404);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }
};

// ─── Contact Form Handler (now with AI qualification) ──────────────

async function handleContact(request, env, ctx) {
  const origin = request.headers.get('Origin') || '';
  if (env.ENVIRONMENT === 'production' && !isAllowedOrigin(origin, env)) {
    return jsonResponse({ success: false, message: 'Forbidden' }, 403);
  }

  const parsed = await parseJsonBody(request, 32_768);
  if (!parsed.ok) return jsonResponse({ success: false, message: parsed.error }, parsed.status, origin);
  const data = parsed.data;

  const { name, email, message } = data;
  if (!name || !email || !message) {
    return jsonResponse({ success: false, message: 'Name, email, and message are required' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ success: false, message: 'Invalid email address' }, 400);
  }
  if (data.botcheck) {
    return jsonResponse({ success: true, message: 'Message sent successfully' });
  }
  const turnstile = await verifyTurnstile(data['cf-turnstile-response'], request, env);
  if (!turnstile.ok) {
    return jsonResponse({ success: false, message: 'Security verification failed. Please refresh and try again.' }, 403, origin);
  }

  const submission = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    name: sanitize(name),
    email: sanitize(email),
    company: sanitize(data.company || ''),
    service: sanitize(data.service || ''),
    message: sanitize(message),
    source: 'website-contact',
    ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    country: request.headers.get('CF-IPCountry') || 'unknown',
    userAgent: request.headers.get('User-Agent') || 'unknown'
  };

  // Cloudflare is the durable ingress only. Atlas performs all reasoning and
  // response drafting inside Hermes Business OS, where approvals are enforced.
  await storeSubmission(env, submission);

  return jsonResponse({ success: true, message: 'Message sent successfully' }, 200, origin);
}

// ─── AI Intake Handler ─────────────────────────────────────────────

async function handleIntake(request, env, ctx) {
  const origin = request.headers.get('Origin') || '';
  if (env.ENVIRONMENT === 'production' && !isAllowedOrigin(origin, env)) {
    return jsonResponse({ success: false, message: 'Forbidden' }, 403);
  }

  const parsed = await parseJsonBody(request, 65_536);
  if (!parsed.ok) return jsonResponse({ success: false, message: parsed.error }, parsed.status, origin);
  const data = parsed.data;

  const turnstile = await verifyTurnstile(data['cf-turnstile-response'], request, env);
  if (!turnstile.ok) {
    return jsonResponse({ success: false, message: 'Security verification failed. Please refresh and try again.' }, 403, origin);
  }

  const { name, email, message } = data;
  if (!name || !email || !message) {
    return jsonResponse({ success: false, message: 'Name, email, and message are required' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ success: false, message: 'Invalid email address' }, 400);
  }
  if (data.botcheck) {
    return jsonResponse({ success: true, message: 'Thank you for your inquiry' });
  }

  const submission = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    name: sanitize(name),
    email: sanitize(email),
    company: sanitize(data.company || ''),
    service: sanitize(data.service || ''),
    message: sanitize(message),
    // Intake-specific fields
    employees: sanitize(data.employees || ''),
    budget: sanitize(data.budget || ''),
    timeline: sanitize(data.timeline || ''),
    current_provider: sanitize(data.current_provider || ''),
    pain_points: sanitize(data.pain_points || ''),
    location: sanitize(data.location || ''),
    desired_outcome: sanitize(data.desired_outcome || ''),
    success_definition: sanitize(data.success_definition || ''),
    evidence_required: sanitize(data.evidence_required || ''),
    preferred_language: sanitize(data.preferred_language || ''),
    source: 'website-intake',
    ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    country: request.headers.get('CF-IPCountry') || 'unknown',
    userAgent: request.headers.get('User-Agent') || 'unknown'
  };

  await storeSubmission(env, submission);

  return jsonResponse({ success: true, message: 'Thank you for your inquiry. We will be in touch shortly.' }, 200, origin);
}

// ─── AI Processing Pipeline ────────────────────────────────────────

async function processWithAI(env, submission) {
  // Step 1: AI Qualification
  let qualification = null;
  if (env.AI) {
    try {
      qualification = await qualifyLead(env.AI, submission);
    } catch (err) {
      console.error('AI qualification failed:', err);
    }
  }

  // Merge qualification into submission
  const enrichedSubmission = {
    ...submission,
    qualification: qualification
  };

  // Step 2: Store enriched submission in KV
  await storeSubmission(env, enrichedSubmission);

  // Step 3: Send AI-enhanced Telegram notification
  await notifyTelegram(env, enrichedSubmission);

  // Step 4: Forward to Web3Forms as email backup
  await forwardToWeb3Forms(env, enrichedSubmission);

  // Step 5: Direct email via Resend (primary when configured)
  await forwardToResend(env, enrichedSubmission);
}

// ─── Admin: List Submissions ───────────────────────────────────────

async function handleListSubmissions(request, env) {
  const url = new URL(request.url);
  const key = readBearerToken(request);

  if (!key || key !== env.ADMIN_KEY) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestedType = url.searchParams.get('type');
  const prefixes = requestedType === 'intake' ? ['intake:'] : requestedType === 'contact' ? ['contact:'] : ['intake:','contact:'];
  const submissions = [];
  for (const prefix of prefixes) {
    const list = await env.SUBMISSIONS.list({ prefix, limit: 100 });
    for (const item of list.keys) {
      const data = await env.SUBMISSIONS.get(item.name, 'json');
      if (data) submissions.push(data);
    }
  }

  submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return jsonResponse({ count: submissions.length, submissions });
}

// ─── Admin: Resend Logs ────────────────────────────────────────────

async function handleResendLogs(request, env) {
  const key = readBearerToken(request);
  if (!key || key !== env.ADMIN_KEY) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const list = await env.SUBMISSIONS.list({ prefix: 'resend-log:', limit: 50 });
  const logs = [];
  for (const item of list.keys) {
    const data = await env.SUBMISSIONS.get(item.name, 'json');
    if (data) logs.push(data);
  }
  logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return jsonResponse({ count: logs.length, logs });
}

async function handleResendStatus(request, env) {
  const key = readBearerToken(request);
  if (!key || key !== env.ADMIN_KEY) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  return jsonResponse({
    hasResendKey: !!env.RESEND_API_KEY,
    resendFrom: env.RESEND_FROM || null,
    forwardTo: env.FORWARD_TO || null
  });
}

// ─── Storage ───────────────────────────────────────────────────────

async function storeSubmission(env, submission) {
  try {
    const prefix = submission.source === 'website-intake' ? 'intake' : 'contact';
    const key = `${prefix}:${submission.timestamp}:${submission.id}`;
    await env.SUBMISSIONS.put(key, JSON.stringify(submission), {
      expirationTtl: 90 * 24 * 60 * 60
    });
    console.log(`Stored ${prefix} submission ${submission.id}`);
  } catch (err) {
    console.error('KV store error:', err);
  }
}

// ─── Telegram Notification (AI-enhanced) ───────────────────────────

async function notifyTelegram(env, submission) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  const emoji = {
    'it-support': '🖥️', 'field-engineering': '🔧', 'cybersecurity': '🔒',
    'asset-lifecycle': '📦', 'cloud-consulting': '☁️', 'managed-services': '🛠️',
    'onsite-dispatch': '🚗', 'office-relocation': '🏢', 'project-management': '📋',
    'networking': '🌐', 'av-solutions': '🎥', 'voip': '📞', 'other': '📝'
  };

  const q = submission.qualification;
  const serviceEmoji = emoji[submission.service] || '📩';
  const isIntake = submission.source === 'website-intake';

  // Score visualization
  const scoreBar = q ? ('🟢'.repeat(Math.min(q.score, 10)) + '⚪'.repeat(10 - Math.min(q.score, 10))) : '';
  const urgencyEmoji = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

  const lines = [
    `${serviceEmoji} <b>${isIntake ? '🤖 AI-Qualified Lead' : 'New Website Inquiry'}</b>`,
    ``
  ];

  // AI Qualification block
  if (q) {
    lines.push(
      `📊 <b>Lead Score:</b> ${q.score}/10 ${scoreBar}`,
      `${urgencyEmoji[q.urgency] || '🟡'} <b>Urgency:</b> ${q.urgency.toUpperCase()}`,
      `🎯 <b>Best Match:</b> ${escapeHtml(q.service_match)}`,
      `👨‍💼 <b>Route to:</b> @${q.agent}`,
      q.tags.length > 0 ? `🏷️ ${q.tags.map(t => '#' + t).join(' ')}` : null,
      ``,
      `💡 <b>AI Summary:</b>`,
      `<i>${escapeHtml(q.summary)}</i>`,
      ``,
      `📝 <b>Suggested Action:</b>`,
      `<i>${escapeHtml(q.suggested_response)}</i>`,
      ``
    );
  }

  // Contact details
  lines.push(
    `─── Contact Details ───`,
    `👤 <b>Name:</b> ${escapeHtml(submission.name)}`,
    `📧 <b>Email:</b> ${escapeHtml(submission.email)}`,
    submission.company ? `🏢 <b>Company:</b> ${escapeHtml(submission.company)}` : null,
    `🌍 <b>Country:</b> ${submission.country}`
  );

  // Intake-specific fields
  if (isIntake) {
    if (submission.employees) lines.push(`👥 <b>Employees:</b> ${escapeHtml(submission.employees)}`);
    if (submission.budget) lines.push(`💰 <b>Budget:</b> ${escapeHtml(submission.budget)}`);
    if (submission.timeline) lines.push(`⏱️ <b>Timeline:</b> ${escapeHtml(submission.timeline)}`);
    if (submission.current_provider) lines.push(`🔄 <b>Current Provider:</b> ${escapeHtml(submission.current_provider)}`);
    if (submission.pain_points) lines.push(`⚠️ <b>Pain Points:</b> ${escapeHtml(submission.pain_points)}`);
  }

  lines.push(
    ``,
    `💬 <b>Message:</b>`,
    escapeHtml(submission.message).slice(0, 800),
    ``,
    `🕐 ${submission.timestamp}`
  );

  const text = lines.filter(Boolean).join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    if (!res.ok) console.error('Telegram API error:', await res.text());
  } catch (err) {
    console.error('Telegram notification failed:', err);
  }
}

// ─── Web3Forms Backup ──────────────────────────────────────────────

async function forwardToWeb3Forms(env, submission) {
  if (!env.WEB3FORMS_KEY) return;

  const q = submission.qualification;
  const aiInfo = q
    ? `\n\n--- AI Qualification ---\nScore: ${q.score}/10 | Urgency: ${q.urgency} | Route: ${q.agent}\nSummary: ${q.summary}\nAction: ${q.suggested_response}`
    : '';

  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_KEY,
        subject: `${q ? `[Score:${q.score}] ` : ''}${submission.source === 'website-intake' ? 'AI Intake' : 'Inquiry'}: ${submission.service || 'General'} — ${submission.name}`,
        from_name: 'Thinkers GK Website',
        name: submission.name,
        email: submission.email,
        company: submission.company,
        service: submission.service,
        message: submission.message + aiInfo,
        country: submission.country
      })
    });
  } catch (err) {
    console.error('Web3Forms forwarding failed:', err);
  }
}

// ─── Resend Direct Email ───────────────────────────────────────────

async function forwardToResend(env, submission) {
  if (!env.RESEND_API_KEY) return;

  const q = submission.qualification;
  const aiInfo = q
    ? `\n\n--- AI Qualification ---\nScore: ${q.score}/10 | Urgency: ${q.urgency} | Route: ${q.agent}\nSummary: ${q.summary}\nAction: ${q.suggested_response}`
    : '';

  const to = env.FORWARD_TO || 'info@thinkersgk.com';
  const from = env.RESEND_FROM || 'Thinkers GK <info@thinkersgk.com>';
  const subject = `${q ? `[Score:${q.score}] ` : ''}${submission.source === 'website-intake' ? 'AI Intake' : 'Inquiry'}: ${submission.service || 'General'} — ${submission.name}`;
  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    submission.company ? `Company: ${submission.company}` : null,
    submission.service ? `Service: ${submission.service}` : null,
    submission.country ? `Country: ${submission.country}` : null,
    ``,
    `Message:`,
    submission.message || '',
    aiInfo || ''
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        reply_to: submission.email
      })
    });
    const raw = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch {}
    const logPayload = {
      timestamp: new Date().toISOString(),
      submissionId: submission.id,
      to,
      from,
      subject,
      status: res.status,
      ok: res.ok,
      response: parsed || raw,
    };
    try {
      const logKey = `resend-log:${logPayload.timestamp}:${submission.id}`;
      await env.SUBMISSIONS.put(logKey, JSON.stringify(logPayload), { expirationTtl: 30 * 24 * 60 * 60 });
    } catch {}
    if (!res.ok) {
      console.error('Resend send failed:', raw);
    }
  } catch (err) {
    console.error('Resend send failed:', err);
  }
}

// ─── Store submission into inbox KV (for Command Center) ───────────

async function storeSubmissionAsInbox(env, submission, account = 'info') {
  if (!env.SUBMISSIONS) return;
  try {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const key = `inbox:${account}:${timestamp}:${id}`;
    await env.SUBMISSIONS.put(key, JSON.stringify({
      id,
      from: submission.email,
      to: `${account}@thinkersgk.com`,
      toLocal: account,
      subject: `${submission.source === 'website-intake' ? 'AI Intake' : 'Inquiry'}: ${submission.service || 'General'} — ${submission.name}`,
      date: timestamp,
      body: submission.message,
      bodyHtml: null,
      headers: { 'x-source': submission.source },
      isRead: false,
      isReply: false,
      meta: {
        name: submission.name,
        company: submission.company,
        service: submission.service,
        country: submission.country,
        timeline: submission.timeline,
        budget: submission.budget,
        employees: submission.employees,
      }
    }), { expirationTtl: 90 * 24 * 60 * 60 });
  } catch (err) {
    console.error('Inbox store failed:', err);
  }
}

// ─── Auto-reply thank you email ───────────────────────────────────

async function sendThankYouReply(env, submission, type = 'contact') {
  const baseLog = {
    timestamp: new Date().toISOString(),
    type: 'thank_you',
    submissionId: submission.id,
    to: submission.email || null,
    from: env.RESEND_FROM || 'Thinkers GK <info@thinkersgk.com>',
    skipped: null,
  };
  if (!env.RESEND_API_KEY || !submission.email) {
    baseLog.skipped = !submission.email ? 'missing_email' : 'missing_resend_key';
    try {
      const logKey = `resend-log:${baseLog.timestamp}:${submission.id}:thankyou`;
      await env.SUBMISSIONS.put(logKey, JSON.stringify(baseLog), { expirationTtl: 30 * 24 * 60 * 60 });
    } catch {}
    return;
  }
  const to = submission.email;
  const from = env.RESEND_FROM || 'Thinkers GK <info@thinkersgk.com>';
  const isJa = /[\u3040-\u30ff\u4e00-\u9faf]/.test(submission.message || '');
  const subject = type === 'intake'
    ? (isJa ? '受付ありがとうございます（AI受付）' : 'Thank you — we received your intake')
    : (isJa ? 'お問い合わせありがとうございます' : 'Thank you — we received your inquiry');
  const text = isJa
    ? `お問い合わせありがとうございます。内容を確認の上、1営業日以内にご連絡いたします。\n\nThinkers GK\ninfo@thinkersgk.com`
    : `Thank you for reaching out. We’ve received your message and will respond within 1 business day.\n\nThinkers GK\ninfo@thinkersgk.com`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        reply_to: 'info@thinkersgk.com'
      })
    });
    const raw = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch {}
    const logPayload = {
      ...baseLog,
      to,
      from,
      subject,
      status: res.status,
      ok: res.ok,
      response: parsed || raw,
    };
    try {
      const logKey = `resend-log:${logPayload.timestamp}:${submission.id}:thankyou`;
      await env.SUBMISSIONS.put(logKey, JSON.stringify(logPayload), { expirationTtl: 30 * 24 * 60 * 60 });
    } catch {}
    if (!res.ok) {
      console.error('Resend thank-you failed:', raw);
    }
  } catch (err) {
    console.error('Resend thank-you failed:', err);
  }
}

// ─── Utilities ─────────────────────────────────────────────────────

// ─── AI Completion Proxy (free Workers AI for Command Center agents) ──────

async function handleAIComplete(request, env) {
  // Simple auth: require a shared secret
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!env.AGENT_API_KEY || token !== env.AGENT_API_KEY) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!env.AI) {
    return jsonResponse({ error: 'Workers AI not available' }, 503);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { messages, model, max_tokens } = body;
  if (!messages || !messages.length) {
    return jsonResponse({ error: 'Missing messages' }, 400);
  }

  // Available free models (best quality → fastest)
  const allowedModels = [
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3.1-8b-instruct',
    '@cf/mistral/mistral-7b-instruct-v0.2',
    '@cf/qwen/qwen1.5-14b-chat-awq',
  ];
  const selectedModel = allowedModels.includes(model) ? model : allowedModels[0];

  try {
    const result = await env.AI.run(selectedModel, {
      messages,
      max_tokens: Math.min(max_tokens || 500, 2000),
      temperature: 0.7,
    });

    return jsonResponse({
      reply: result.response || result.result || '',
      model: selectedModel,
      provider: 'cloudflare-workers-ai',
    });
  } catch (err) {
    console.error('Workers AI error:', err);
    return jsonResponse({ error: 'AI generation failed: ' + err.message }, 500);
  }
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    }
  });
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'thinkersgk.com' || host === 'www.thinkersgk.com' ||
      (env.ENVIRONMENT !== 'production' && (host === 'localhost' || host === '127.0.0.1'));
  } catch { return false; }
}

function readBearerToken(request) {
  const match = (request.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function handleCORS(env) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function sanitize(str) {
  return String(str).trim().slice(0, 2000);
}

async function parseJsonBody(request, maxBytes) {
  const declared = Number.parseInt(request.headers.get('Content-Length') || '0', 10);
  if (declared > maxBytes) return { ok: false, status: 413, error: 'Request too large' };
  let raw;
  try { raw = await request.text(); } catch { return { ok: false, status: 400, error: 'Invalid request body' }; }
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return { ok: false, status: 413, error: 'Request too large' };
  try { return { ok: true, data: JSON.parse(raw) }; } catch { return { ok: false, status: 400, error: 'Invalid JSON' }; }
}

async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET) {
    console.error('TURNSTILE_SECRET is not configured');
    return { ok: false };
  }
  if (!token || String(token).length > 2048) return { ok: false };
  try {
    const body = new FormData();
    body.set('secret', env.TURNSTILE_SECRET);
    body.set('response', String(token));
    body.set('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const result = await response.json();
    const hostname = String(result.hostname || '').toLowerCase();
    return { ok: result.success === true && (hostname === 'thinkersgk.com' || hostname === 'www.thinkersgk.com') };
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return { ok: false };
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
