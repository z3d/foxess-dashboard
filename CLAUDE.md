# FoxESS Battery Monitor Dashboard

Single Cloudflare Worker serving a static dashboard (HTML/CSS/JS) and JSON API endpoints that proxy the FoxESS Cloud API. Monitors a hybrid inverter and battery system in real time.

## Quick Commands

- `npx wrangler dev` — local dev server at `http://localhost:8787`
- `npx wrangler deploy` — deploy to Cloudflare (also triggered by git push to `master`)
- Git push to `master` auto-deploys via Cloudflare Git integration

## Architecture

```
├── wrangler.jsonc          # Worker config (name, entry, assets)
├── public/
│   ├── index.html          # Single-file dashboard (HTML + CSS + JS)
│   └── robots.txt
└── src/
    ├── worker.js           # Worker entry: routes /api/* requests
    └── lib/
        └── foxess.js       # Shared helpers (FoxESS API, auth, CORS, caching)
```

- **Static assets** (`public/`) served via Cloudflare Workers Static Assets (`assets.directory` in wrangler.jsonc)
- **API routes** handled in `src/worker.js` — non-`/api/` requests fall through to `env.ASSETS.fetch(request)`
- **Shared helpers** in `src/lib/foxess.js` — FoxESS signature generation (MD5), CORS, auth validation, edge caching via `caches.default`

## Critical Constraints

### iOS 12 Safari Compatibility (Frontend Only)

`public/index.html` MUST work on iOS 12 Safari:

- **No arrow functions** — use `function() {}` everywhere
- **No `let`/`const`** — use `var` only
- **No template literals** — use string concatenation
- **No `for...of` loops** — use indexed `for` loops
- **No destructuring, spread, rest, optional chaining (`?.`), nullish coalescing (`??`)**
- **No `Promise.allSettled`, `Object.entries`, `Array.flat`**
- **Use `-webkit-` prefixes** for CSS where needed
- **Use `XMLHttpRequest`** — not `fetch()`

The Worker code (`src/`) runs on Cloudflare's V8 runtime and CAN use modern JS, but existing code uses ES5 style for consistency.

### Single-File Frontend

`public/index.html` is a single file containing all HTML, CSS, and JavaScript. Do not split it into separate files.

### Version Bumping

`public/index.html` has `<meta name="app-version" content="X.Y.Z">`. Bump this (semver) whenever changing index.html. The auto-update banner compares this against localStorage to notify users.

## Common Gotchas

- **FoxESS signature**: Uses literal `\r\n` characters (escaped, not actual CRLF) in the MD5 hash — see `generateSignature()` in `src/lib/foxess.js`
- **Open-Meteo timestamps**: Always use `&timeformat=unixtime` and parse with `new Date(timestamp * 1000)` — ISO strings without timezone offset get parsed as UTC in some browsers
- **DOM elements**: All cached in the `elements` object, initialized in `initializeElements()` — add new elements there
- **User config**: Stored in the `config` object, persisted to `localStorage` via `loadSettings()`/`saveSettings()`
- **Edge caching**: `cachedFetch()` uses `caches.default` with a synthetic Request URL (`https://cache.internal/key`) — cache keys must be unique per data type

## Environment Variables (Cloudflare Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `FOXESS_API_KEY` | Yes | FoxESS Cloud API key |
| `FOXESS_DEVICE_SN` | Yes | Inverter serial number |
| `API_KEY` | Yes | Dashboard authentication key |
| `ALLOWED_ORIGIN` | No | CORS origin (default: `*`) |
| `CACHE_TTL` | No | Cache seconds (default: `60`) |

## API Routes

All defined in `src/worker.js`:

| Route | Auth | Description |
|-------|------|-------------|
| `GET /api/health` | No | Returns `{"status":"ok","timestamp":...}` |
| `GET/POST /api/realtime` | Yes (`X-API-Key` header) | Real-time inverter data from FoxESS |
| `GET/POST /api/report?type=day` | Yes (`X-API-Key` header) | Energy report data from FoxESS |

## Deployment

- Worker name: `lucky-glade-17da`
- URL: `https://lucky-glade-17da.zainulabedeen.workers.dev`

## Workflow Rules

- After making changes, ask the user before committing and pushing
- Always bump the version in `index.html` when modifying it
- Keep README.md, CLAUDE.md, AGENTS.md, and skills up to date when making structural changes
- Run `/reflect` after completing significant features

## External APIs

- **FoxESS Cloud API**: `https://www.foxesscloud.com/op/v0/...` — requires MD5 signature auth (see `src/lib/foxess.js`)
- **Open-Meteo**: `https://api.open-meteo.com/v1/forecast` — free weather API, no auth needed
