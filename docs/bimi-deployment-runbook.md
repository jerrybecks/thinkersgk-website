# Thinkers GK BIMI Deployment Runbook

Domain: `thinkersgk.com`

Status checked: 2026-07-15

## Current state

- Google Workspace MX, SPF, and DKIM are published.
- Zoho verification, DKIM, and SPF authorization have been removed.
- SES/Resend custom MAIL FROM uses `send.thinkersgk.com` with the required MX and `include:amazonses.com` SPF records.
- Cloudflare DMARC Management is collecting aggregate reports.
- DMARC remains non-enforcing: `v=DMARC1; p=none; rua=mailto:42c1c49ce8854caea9436fceb7b96367@dmarc-reports.cloudflare.net;`
- No BIMI assertion is published yet.

## Enforcement gate

Review at least seven days of DMARC reports. Confirm Google Workspace and SES/Resend messages consistently pass aligned SPF or DKIM before changing policy.

Stage one:

```text
v=DMARC1; p=quarantine; rua=mailto:42c1c49ce8854caea9436fceb7b96367@dmarc-reports.cloudflare.net; adkim=r; aspf=r; pct=100
```

After at least seven additional clean days, stage two:

```text
v=DMARC1; p=reject; rua=mailto:42c1c49ce8854caea9436fceb7b96367@dmarc-reports.cloudflare.net; adkim=r; aspf=r; pct=100
```

## BIMI asset

The candidate logo is `assets/bimi-logo.svg`, intended for:

```text
https://www.thinkersgk.com/assets/bimi-logo.svg
```

It is a 100×100 SVG Tiny P/S 1.2 file with a solid background, title, accessibility description, and no fonts, scripts, animation, embedded raster content, or external references. It validates against the BIMI Group's current SVG P/S RNC schema and is under 32 KB.

## Certificate decision

- Google requires a Common Mark Certificate (CMC) or Verified Mark Certificate (VMC) for Gmail BIMI display.
- A CMC supports a logo that is not a registered trademark, subject to the issuer's validation requirements.
- A VMC requires an eligible registered trademark or government mark and can provide Gmail's verified checkmark.

## BIMI publication

Self-asserted SVG form for supporting non-Gmail providers:

```text
v=BIMI1; l=https://www.thinkersgk.com/assets/bimi-logo.svg
```

Gmail certificate form after obtaining and hosting the CMC/VMC PEM:

```text
v=BIMI1; l=; a=https://www.thinkersgk.com/.well-known/bimi/thinkersgk.pem
```

Do not publish either record until DMARC enforcement is active at `pct=100`.

## Verification

```sh
dig +short TXT thinkersgk.com
dig +short TXT _dmarc.thinkersgk.com
dig +short TXT google._domainkey.thinkersgk.com
dig +short TXT default._bimi.thinkersgk.com
curl -I https://www.thinkersgk.com/assets/bimi-logo.svg
```
