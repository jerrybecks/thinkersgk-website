const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DATA_FILE = path.join(__dirname, 'threads.json');
const STATE_FILE = path.join(__dirname, '.notifier-state.json');
const LOG_FILE = path.join(__dirname, '.notifier-log.json');
const POLL_MS = 3000;
const WATCH_DEBOUNCE_MS = 600;
const AUTHOR = 'codex';
let watchTimer = null;

function appendRuntimeLog(line) {
  fs.appendFileSync(
    path.join(__dirname, '.notifier-runtime.log'),
    `[${new Date().toISOString()}] ${line}\n`
  );
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function loadThreads() {
  return readJson(DATA_FILE, { threads: [] }).threads || [];
}

function loadState() {
  return readJson(STATE_FILE, {
    seenMessageIds: [],
    notifiedTurns: {},
    lastRunAt: null
  });
}

function saveState(state) {
  state.lastRunAt = new Date().toISOString();
  writeJson(STATE_FILE, state);
}

function appendLog(entry) {
  const log = readJson(LOG_FILE, []);
  log.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
  writeJson(LOG_FILE, log.slice(-200));
}

function getNextTurn(thread) {
  if (thread.status === 'resolved') return null;
  const agents = (thread.participants || []).filter((p) => p !== 'user');
  if (agents.length === 0) return null;
  if (!thread.messages || thread.messages.length === 0) return agents[0] || null;
  const lastAuthor = thread.messages[thread.messages.length - 1].author;
  const idx = agents.indexOf(lastAuthor);
  if (idx === -1) return agents[0];
  return agents[(idx + 1) % agents.length];
}

function short(text, max = 120) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + '…';
}

function notify(title, message) {
  try {
    execFileSync('osascript', [
      '-e',
      `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`
    ]);
    return true;
  } catch {
    return false;
  }
}

function checkOnce() {
  const threads = loadThreads();
  const state = loadState();
  const seen = new Set(state.seenMessageIds || []);
  const notifiedTurns = state.notifiedTurns || {};
  let changed = false;

  for (const thread of threads) {
    const messages = thread.messages || [];
    const nextTurn = getNextTurn(thread);

    for (const msg of messages) {
      if (seen.has(msg.id)) continue;
      seen.add(msg.id);
      changed = true;

      if (msg.author === 'claude') {
        const ok = notify(
          `Claude replied: ${thread.topic}`,
          short(msg.content, 140)
        );
        appendLog({
          type: 'claude_message',
          threadId: thread.id,
          topic: thread.topic,
          messageId: msg.id,
          delivered: ok
        });
      }
    }

    if (thread.status !== 'resolved' && nextTurn === AUTHOR) {
      const turnKey = `${thread.id}:${messages.length}`;
      if (notifiedTurns[thread.id] !== turnKey) {
        const last = messages[messages.length - 1];
        const preview = last ? `${last.author}: ${short(last.content, 110)}` : 'New thread awaiting response.';
        const ok = notify(
          `Your turn in Agent Room`,
          `${thread.topic} — ${preview}`
        );
        notifiedTurns[thread.id] = turnKey;
        changed = true;
        appendLog({
          type: 'your_turn',
          threadId: thread.id,
          topic: thread.topic,
          delivered: ok
        });
      }
    }
  }

  state.seenMessageIds = Array.from(seen).slice(-2000);
  state.notifiedTurns = notifiedTurns;
  if (changed) saveState(state);
}

function ensureStateSeeded() {
  if (fs.existsSync(STATE_FILE)) return;
  const threads = loadThreads();
  const seeded = {
    seenMessageIds: threads.flatMap((t) => (t.messages || []).map((m) => m.id)).slice(-2000),
    notifiedTurns: {},
    lastRunAt: new Date().toISOString()
  };
  writeJson(STATE_FILE, seeded);
}

ensureStateSeeded();
appendRuntimeLog('notifier booted');

function safeCheckOnce() {
  try {
    checkOnce();
  } catch (error) {
    appendRuntimeLog(`check failed: ${error && error.stack ? error.stack : error}`);
  }
}

safeCheckOnce();
setInterval(safeCheckOnce, POLL_MS);

try {
  fs.watch(DATA_FILE, () => {
    if (watchTimer) clearTimeout(watchTimer);
    watchTimer = setTimeout(() => {
      appendRuntimeLog('threads.json changed; running immediate check');
      safeCheckOnce();
    }, WATCH_DEBOUNCE_MS);
  });
  appendRuntimeLog('file watch enabled');
} catch (error) {
  appendRuntimeLog(`file watch unavailable: ${error && error.stack ? error.stack : error}`);
}

process.on('uncaughtException', (error) => {
  appendRuntimeLog(`uncaughtException: ${error && error.stack ? error.stack : error}`);
});

process.on('unhandledRejection', (error) => {
  appendRuntimeLog(`unhandledRejection: ${error && error.stack ? error.stack : error}`);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
