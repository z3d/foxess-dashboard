---
name: adding-backend-feature
description: "Add a new API endpoint or backend feature to the Cloudflare Worker. Use when adding routes to src/worker.js, new FoxESS API integrations, or shared helpers in src/lib/foxess.js."
user-invocable: true
argument-hint: "[e.g. 'add battery history endpoint' or 'add rate limiting']"
---

# Adding a Backend Feature

You are adding a new API endpoint or backend capability to the FoxESS Cloudflare Worker.

## Before Starting

1. Read `src/worker.js` to understand the routing pattern
2. Read `src/lib/foxess.js` to understand shared helpers
3. Read `wrangler.jsonc` for Worker configuration

## Architecture

- `src/worker.js` — single entry point, routes requests by `url.pathname`
- `src/lib/foxess.js` — shared helpers (FoxESS API calls, auth, CORS, caching)
- Static assets from `public/` served via `env.ASSETS.fetch(request)`
- All `/api/*` routes handled by the Worker; everything else falls through to static assets

## Adding a New API Endpoint

1. **Add route** in `src/worker.js` following the existing `if/else if` pattern:
   ```javascript
   } else if (path === '/api/your-endpoint') {
     if (!validateApiKey(request, env)) {
       response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
         status: 401, headers: { 'Content-Type': 'application/json' }
       });
     } else {
       // Your logic here
       response = new Response(JSON.stringify(data), {
         headers: { 'Content-Type': 'application/json' }
       });
     }
   ```

2. **Add shared helpers** to `src/lib/foxess.js` if reusable:
   - Export the function: `export async function yourHelper(env) { ... }`
   - Import in worker.js: add to the existing import statement

3. **Use caching** if calling an external API:
   ```javascript
   var ttl = parseInt(env.CACHE_TTL) || 60;
   var cached = await cachedFetch('unique-cache-key', function() {
     return yourFetchFunction(env);
   }, ttl);
   ```

4. **Auth**: Use `validateApiKey(request, env)` for protected endpoints. Only `/api/health` is public.

5. **CORS**: Handled automatically at the end of the fetch handler — no per-route CORS needed.

## FoxESS API Integration

When calling a new FoxESS endpoint:
1. Use `createFoxESSHeaders(path, env.FOXESS_API_KEY)` for auth headers
2. Base URL: `https://www.foxesscloud.com`
3. POST with JSON body, include `sn: env.FOXESS_DEVICE_SN`
4. Signature uses literal `\r\n` (escaped, not actual CRLF) — see `generateSignature()`

## Adding Environment Variables

1. Add in Cloudflare Dashboard (Settings > Variables and Secrets)
2. Access via `env.VARIABLE_NAME` in Worker code
3. Document in README.md and CLAUDE.md environment variables tables

## After Implementation

1. Test locally with `npx wrangler dev` if possible
2. Update API Routes tables in README.md and CLAUDE.md
3. Ask the user if they want to commit and push
4. If committing, use a concise message with `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
5. Run `/reflect` to update documentation
