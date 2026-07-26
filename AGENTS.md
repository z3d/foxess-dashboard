# FoxESS Battery Monitor Dashboard

Single Cloudflare Worker serving a static dashboard (`public/index.html`) and `/api/*` routes (`src/worker.js`) that proxy the FoxESS Cloud API. Monitors a hybrid inverter and battery in real time. Shared helpers (FoxESS signature, auth, CORS, caching) live in `src/lib/foxess.js`; routes are readable in `src/worker.js`.

## Commands

```bash
npm run setup      # interactive setup wizard
npm run dev        # local dev at http://localhost:8787
npm run deploy     # deploy (git push to master also auto-deploys)
```

## Critical rules

- **`public/index.html` must run on iOS 12 Safari**: no arrow functions, `let`/`const`, template literals, `for...of`, destructuring/spread/`?.`/`??`, `Promise.allSettled`, `Object.entries`, `Array.flat`. Use `var`, `function() {}`, string concatenation, indexed loops, `XMLHttpRequest`, `-webkit-` prefixes. Worker code (`src/`) is modern V8 but stays ES5-style for consistency.
- **Single file, versioned**: everything stays in `public/index.html`; bump `<meta name="app-version">` (semver) on every change.
- **The FoxESS signature uses literal `\r\n` characters** (escaped, not actual CRLF) in the MD5 hash — see `generateSignature()` in `src/lib/foxess.js`. This is the #1 way the integration breaks.
- **Edge caching uses `caches.default` with synthetic Request URLs** (`https://cache.internal/key`) — cache keys must be unique per data type. (Unlike brisbane-dashboard, this repo does use `caches.default`.)
- **Open-Meteo**: always `&timeformat=unixtime`, parse `new Date(ts * 1000)` — ISO strings without offset parse as UTC in some browsers.
- **Discharge-cutoff state machine is subtle** — read the current logic in `index.html` before touching it: `forceDischargePeriods` defaults `{start: 18, end: 20}`; cutoff and the manual stop button only exist inside configured windows; manual/auto resume suppresses another cutoff for the current window until SoC rises above the auto threshold; optional `dischargeCutoffFirstHourThreshold` (0 = off) applies a higher stop SoC until `dischargeCutoffFinalStageHours` before the window end (default 1; 0.5–6 in 0.5 steps), tracked via a persisted phase key, auto-resuming at the final stage *without* setting resume suppression.
- **Toolchain**: Wrangler 4 needs Node 22+ (matches the configured 2026 compatibility date).

## Offline / standalone

`public/sw.js` prevents blank-screen-of-death for the iOS home-screen app: network-first with cached-HTML fallback and a styled offline page; precaches `/` on install; hooks `XMLHttpRequest.prototype.send` to show the red OFFLINE badge; `forceReload()` clears only non-SW caches so the offline fallback survives forced reloads.

## Environment variables (Cloudflare dashboard)

`FOXESS_API_KEY`, `FOXESS_DEVICE_SN`, `API_KEY` (dashboard auth — all routes except `/api/health` need the `X-API-Key` header) required; `ALLOWED_ORIGIN` (default `*`) and `CACHE_TTL` (default 60s) optional.

## External APIs

FoxESS Cloud (`https://www.foxesscloud.com/op/v0/...`, MD5 signature auth), Open-Meteo (free, no auth), Forecast.solar (production forecast).

## Deployment and workflow

Worker `lucky-glade-17da` at `https://lucky-glade-17da.zainulabedeen.workers.dev`. **Ask before committing and pushing.** Bump the version on `index.html` changes; keep README.md, AGENTS.md, CLAUDE.md, and skills in sync (run the `reflecting` skill after significant features).

## Where to look

| Task | Skill |
|---|---|
| New API route / worker feature | `.agents/skills/adding-backend-feature/SKILL.md` |
| New UI feature | `.agents/skills/adding-frontend-feature/SKILL.md` |
| Doc sync after changes | `.agents/skills/reflecting/SKILL.md` |
