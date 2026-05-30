const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3456;
const DATA_FILE = path.join(__dirname, 'threads.json');
const UI_FILE = path.join(__dirname, 'ui.html');
const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const CONFIG_PATH = path.join(OPENCLAW_DIR, 'openclaw.json');

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function shortText(text, max = 180) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

async function sendTelegramNotification(text) {
  const cfg = readConfig();
  const telegram = cfg?.channels?.telegram;
  if (!telegram || telegram.enabled === false) return false;

  const accounts = telegram.accounts || {};
  const botToken = accounts.agentroom?.botToken || accounts.jeff?.botToken || accounts.default?.botToken;
  const chatId = accounts.agentroom?.allowFrom?.[0]
    || accounts.default?.allowFrom?.[0]
    || accounts.jeff?.allowFrom?.[0];
  if (!botToken || !chatId || !text) return false;

  try {
    const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: String(text),
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(5000)
    });
    return resp.ok;
  } catch {
    return false;
  }
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { threads: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Determine whose turn it is in a thread
function getNextTurn(thread) {
  if (thread.status === 'resolved') return null;
  if (thread.messages.length === 0) return thread.participants[0] || 'claude';
  const lastMsg = thread.messages[thread.messages.length - 1];
  const lastAuthor = lastMsg.author;
  // Skip 'user' in turn rotation — only alternate between agents
  const agents = thread.participants.filter(p => p !== 'user');
  if (agents.length < 2) return agents[0] || null;
  const idx = agents.indexOf(lastAuthor);
  if (idx === -1) return agents[0];
  return agents[(idx + 1) % agents.length];
}

// Check if a thread has converged (both sides said "agree" or "for" recently)
function checkConvergence(thread) {
  const msgs = thread.messages;
  if (msgs.length < 4) return false; // need at least a few rounds
  const last4 = msgs.slice(-4);
  const authors = new Set(last4.map(m => m.author).filter(a => a !== 'user'));
  if (authors.size < 2) return false;
  // Check if recent messages from both agents signal agreement
  const agreeSignals = ['agree', 'accepted', 'confirmed', 'deal', 'let\'s proceed', 'implement'];
  let agreements = 0;
  for (const m of last4) {
    if (m.author === 'user') continue;
    const lower = m.content.toLowerCase();
    if (agreeSignals.some(s => lower.includes(s)) || m.position === 'for') {
      agreements++;
    }
  }
  return agreements >= 2;
}

const server = http.createServer(async (req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  // GET / — serve UI
  if (req.method === 'GET' && parts.length === 0) {
    try {
      const html = fs.readFileSync(UI_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch {
      res.writeHead(500);
      return res.end('UI file not found');
    }
  }

  // GET /threads — list all threads
  if (req.method === 'GET' && parts[0] === 'threads' && parts.length === 1) {
    const data = loadData();
    const summary = data.threads.map(t => ({
      id: t.id,
      topic: t.topic,
      status: t.status,
      participants: t.participants,
      messageCount: t.messages.length,
      nextTurn: getNextTurn(t),
      created: t.created,
      updated: t.updated
    }));
    return json(res, 200, summary);
  }

  // POST /threads — create a thread
  if (req.method === 'POST' && parts[0] === 'threads' && parts.length === 1) {
    try {
      const body = await parseBody(req);
      if (!body.topic) return json(res, 400, { error: 'topic is required' });

      const data = loadData();
      const thread = {
        id: generateId(),
        topic: body.topic,
        description: body.description || '',
        status: 'open',
        participants: body.participants || ['claude', 'codex'],
        messages: [],
        decisions: [],
        maxRounds: body.maxRounds || 8, // auto-converge after this many rounds
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      data.threads.push(thread);
      saveData(data);
      return json(res, 201, thread);
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  // GET /threads/:id — get thread with messages
  if (req.method === 'GET' && parts[0] === 'threads' && parts.length === 2) {
    const data = loadData();
    const thread = data.threads.find(t => t.id === parts[1]);
    if (!thread) return json(res, 404, { error: 'Thread not found' });
    return json(res, 200, {
      ...thread,
      nextTurn: getNextTurn(thread),
      converged: checkConvergence(thread)
    });
  }

  // GET /poll/:author — check if it's this author's turn or they're @-mentioned
  if (req.method === 'GET' && parts[0] === 'poll' && parts.length === 2) {
    const author = parts[1];
    const data = loadData();
    const pending = [];
    const seen = new Set();

    for (const t of data.threads) {
      if (t.status === 'resolved') continue;
      if (!t.participants.includes(author)) continue;

      let reason = null;
      const turn = getNextTurn(t);
      if (turn === author) reason = 'your_turn';

      // Also check if @-mentioned in recent messages not by this author
      if (!reason) {
        const recent = t.messages.slice(-5);
        for (const m of recent) {
          if (m.author !== author && m.content && m.content.includes(`@${author}`)) {
            reason = 'mentioned';
            break;
          }
        }
      }

      // Also check if user posted and all agents should respond (group request)
      if (!reason) {
        const lastMsg = t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
        if (lastMsg && lastMsg.author === 'user') {
          // User's message — all participant agents should see it
          const agentRepliedAfter = t.messages.some(m =>
            m.author === author && new Date(m.timestamp) > new Date(lastMsg.timestamp)
          );
          if (!agentRepliedAfter) reason = 'user_waiting';
        }
      }

      if (reason && !seen.has(t.id)) {
        seen.add(t.id);
        const lastMsg = t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
        pending.push({
          threadId: t.id,
          topic: t.topic,
          messageCount: t.messages.length,
          lastMessage: lastMsg ? { author: lastMsg.author, content: lastMsg.content, position: lastMsg.position } : null,
          roundNumber: Math.ceil(t.messages.length / 2),
          reason
        });
      }
    }

    return json(res, 200, {
      author,
      yourTurn: pending.length > 0,
      threads: pending
    });
  }

  // POST /threads/:id/messages — post a message
  if (req.method === 'POST' && parts[0] === 'threads' && parts[2] === 'messages' && parts.length === 3) {
    try {
      const body = await parseBody(req);
      if (!body.author) return json(res, 400, { error: 'author is required' });
      if (!body.content) return json(res, 400, { error: 'content is required' });

      const validAuthors = ['claude', 'codex', 'gemini', 'user', 'jeff'];
      if (!validAuthors.includes(body.author)) {
        return json(res, 400, { error: `author must be one of: ${validAuthors.join(', ')}` });
      }

      const data = loadData();
      const thread = data.threads.find(t => t.id === parts[1]);
      if (!thread) return json(res, 404, { error: 'Thread not found' });
      if (thread.status === 'resolved') {
        return json(res, 400, { error: 'Thread is resolved. Reopen it first.' });
      }

      const message = {
        id: generateId(),
        author: body.author,
        content: body.content,
        position: body.position || null,
        references: body.references || [],
        timestamp: new Date().toISOString()
      };

      thread.messages.push(message);
      if (!thread.participants.includes(body.author)) {
        thread.participants.push(body.author);
      }
      thread.updated = new Date().toISOString();

      // Calculate next turn and convergence info
      const nextTurn = getNextTurn(thread);
      const converged = checkConvergence(thread);
      const roundNumber = Math.ceil(thread.messages.length / 2);
      const maxRounds = thread.maxRounds || 8;

      saveData(data);
      const telegramText = `${thread.topic}\n${message.author}: ${shortText(message.content, 200)}`;
      sendTelegramNotification(telegramText).catch(() => {});
      return json(res, 201, {
        message,
        nextTurn,
        converged,
        roundNumber,
        maxRounds,
        hint: converged
          ? 'Both sides appear to agree. Consider resolving this thread.'
          : roundNumber >= maxRounds
            ? `Round ${roundNumber}/${maxRounds} reached. User should review and decide.`
            : `It is now ${nextTurn}'s turn to respond.`
      });
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  // GET /threads/:id/messages — list messages
  if (req.method === 'GET' && parts[0] === 'threads' && parts[2] === 'messages' && parts.length === 3) {
    const data = loadData();
    const thread = data.threads.find(t => t.id === parts[1]);
    if (!thread) return json(res, 404, { error: 'Thread not found' });
    return json(res, 200, thread.messages);
  }

  // PATCH /threads/:id — update thread status
  if (req.method === 'PATCH' && parts[0] === 'threads' && parts.length === 2) {
    try {
      const body = await parseBody(req);
      const data = loadData();
      const thread = data.threads.find(t => t.id === parts[1]);
      if (!thread) return json(res, 404, { error: 'Thread not found' });

      if (body.status) {
        const validStatuses = ['open', 'disputed', 'resolved'];
        if (!validStatuses.includes(body.status)) {
          return json(res, 400, { error: `status must be one of: ${validStatuses.join(', ')}` });
        }
        thread.status = body.status;
      }

      if (body.decision) {
        thread.decisions.push({
          text: body.decision,
          decidedBy: body.decidedBy || 'user',
          timestamp: new Date().toISOString()
        });
      }

      thread.updated = new Date().toISOString();
      saveData(data);
      return json(res, 200, thread);
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  // POST /threads/:id/resolve — resolve with final decision
  if (req.method === 'POST' && parts[0] === 'threads' && parts[2] === 'resolve' && parts.length === 3) {
    try {
      const body = await parseBody(req);
      if (!body.decision) return json(res, 400, { error: 'decision is required' });

      const data = loadData();
      const thread = data.threads.find(t => t.id === parts[1]);
      if (!thread) return json(res, 404, { error: 'Thread not found' });

      thread.status = 'resolved';
      thread.decisions.push({
        text: body.decision,
        decidedBy: body.decidedBy || 'user',
        timestamp: new Date().toISOString()
      });
      thread.updated = new Date().toISOString();
      saveData(data);
      return json(res, 200, thread);
    } catch (e) {
      return json(res, 400, { error: e.message });
    }
  }

  // GET /export — export all resolved decisions as markdown
  if (req.method === 'GET' && parts[0] === 'export') {
    const data = loadData();
    const resolved = data.threads.filter(t => t.status === 'resolved');

    let md = '# Design Decisions — Agent Room Export\n\n';
    md += `_Exported: ${new Date().toISOString()}_\n\n---\n\n`;

    for (const t of resolved) {
      md += `## ${t.topic}\n\n`;
      if (t.description) md += `${t.description}\n\n`;
      md += `**Status:** Resolved\n`;
      md += `**Participants:** ${t.participants.join(', ')}\n`;
      md += `**Messages:** ${t.messages.length}\n\n`;

      for (const d of t.decisions) {
        md += `### Decision (${d.decidedBy}, ${d.timestamp.split('T')[0]})\n\n`;
        md += `${d.text}\n\n`;
      }
      md += '---\n\n';
    }

    res.writeHead(200, { 'Content-Type': 'text/markdown' });
    return res.end(md);
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n  Agent Room running at http://localhost:${PORT}\n`);
  console.log('  Endpoints:');
  console.log('    GET  /                       — Web UI');
  console.log('    GET  /threads                — List threads');
  console.log('    POST /threads                — Create thread');
  console.log('    GET  /threads/:id            — Get thread (includes nextTurn, converged)');
  console.log('    POST /threads/:id/messages   — Post message (returns nextTurn hint)');
  console.log('    GET  /threads/:id/messages   — Get messages');
  console.log('    GET  /poll/:author           — Check if it\'s your turn');
  console.log('    PATCH /threads/:id           — Update status');
  console.log('    POST /threads/:id/resolve    — Resolve thread');
  console.log('    GET  /export                 — Export decisions as markdown');
  console.log('');
});
