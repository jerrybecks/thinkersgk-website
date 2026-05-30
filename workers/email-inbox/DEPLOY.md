# Email Inbox Worker — Deploy Guide

## One-time setup

```bash
cd /Users/mac/agent-workspaces/thinkersgk-website/workers/email-inbox

# 1. Install Wrangler (if not already)
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create KV namespace
wrangler kv:namespace create INBOX_KV
# Copy the returned id into wrangler.toml → kv_namespaces[0].id

# 4. Deploy Worker
wrangler deploy
```

## Cloudflare Dashboard steps (after deploy)

1. Go to **Cloudflare Dashboard → Email → Email Routing**
2. Enable Email Routing for your domain (thinkersgk.com)
3. Go to **Routing Rules**
4. Add rule: Catch-all → **Send to Worker** → `thinkersgk-email-inbox`
5. Save

## Verify

```bash
# Should return { messages: [], total: 0 }
curl https://thinkersgk.com/api/inbox
```

## Routes exposed by Worker

| Route | Purpose |
|-------|---------|
| `GET /api/inbox` | List message envelopes (from, to, subject, date) |
| `GET /api/inbox/read?key=X` | Get full raw email + envelope by key |

The hub's `src/services/email/inbox.js` polls these endpoints automatically.
