---
name: adding-backend-feature
description: "Add a new API endpoint or backend feature to the Cloudflare Worker. Use when adding routes to src/worker.js, new FoxESS API integrations, or shared helpers in src/lib/foxess.js."
user-invocable: true
argument-hint: "[e.g. 'add battery history endpoint' or 'add rate limiting']"
---

# Adding a Backend Feature

`src/worker.js` is the single entry point, routing by `url.pathname` through an `if/else if` chain; non-`/api/*` requests fall through to static assets via `env.ASSETS.fetch(request)`. Shared helpers live in `src/lib/foxess.js` — read a neighbouring route before adding one; the local pattern is the spec.

## The rules

- **Auth**: every endpoint except `/api/health` calls `validateApiKey(request, env)` and returns a JSON 401 on failure.
- **CORS is handled once** at the end of the fetch handler — no per-route CORS.
- **Cache external-API calls** through `cachedFetch('unique-cache-key', fn, ttl)` with `var ttl = parseInt(env.CACHE_TTL) || 60`. Keys are synthetic Request URLs, so they must be unique per data type.
- **FoxESS calls**: `createFoxESSHeaders(path, env.FOXESS_API_KEY)`, base `https://www.foxesscloud.com`, POST JSON with `sn: env.FOXESS_DEVICE_SN`. The signature uses **literal `\r\n`** (escaped, not CRLF) — see `generateSignature()`.
- **Reusable logic goes in `src/lib/foxess.js`** as an export, added to the existing import in `worker.js`.
- **New env vars**: add in the Cloudflare dashboard (Settings → Variables and Secrets), read via `env.NAME`, and document in the README and CLAUDE.md tables.

## After implementing

Test with `npx wrangler dev` where possible, update the API-route tables in README.md, **ask before committing/pushing**, and run the `reflecting` skill if the change is significant.

## Related skills

- `adding-frontend-feature` — the UI consuming the new route
- `reflecting` — doc sync afterwards
