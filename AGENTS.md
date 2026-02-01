# Agents Guide

## Project Context

This is a Cloudflare Worker project that serves a single-page IoT monitoring dashboard and a JSON API. See @CLAUDE.md for full architecture details.

## Build & Deploy

- No build step required — deploy directly with `npx wrangler deploy`
- Local dev: `npx wrangler dev` (serves from `public/` with Worker handling `/api/*`)
- Git push to `master` auto-deploys via Cloudflare

## Code Conventions

### Frontend (`public/index.html`)

- Single-file app: all HTML, CSS, JS in one file
- **ES5 JavaScript only** — iOS 12 Safari compatibility required
- No arrow functions, no let/const, no template literals, no destructuring
- Use `var`, `function() {}`, string concatenation, indexed `for` loops
- Use `-webkit-` CSS prefixes where needed
- DOM elements cached in an `elements` object, initialized in `initializeElements()`
- Config stored in `config` object, persisted to `localStorage`
- XHR used instead of `fetch()` for iOS 12 compatibility

### Backend (`src/worker.js`, `src/lib/foxess.js`)

- Cloudflare Workers module format: `export default { async fetch(request, env) {} }`
- Route matching via `url.pathname` string comparison in worker.js
- Shared helpers in `src/lib/foxess.js` — imported by worker.js
- CORS handled globally in worker.js (not per-route)
- Auth via `X-API-Key` header validated against `env.API_KEY`
- Edge caching via `caches.default` with configurable TTL

## Commit Guidelines

- Always ask the user before committing and pushing
- Use concise commit messages focused on the "why"
- Add `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` to commits
- Bump `<meta name="app-version">` in index.html when modifying it (semver)
- Commit specific files, not `git add -A`

## Adding Features

### New API endpoint
1. Add route handler in `src/worker.js` (follow existing pattern)
2. Add shared logic to `src/lib/foxess.js` if reusable
3. Update the API Routes table in README.md and CLAUDE.md

### New dashboard UI element
1. Add HTML in the appropriate section of `public/index.html`
2. Add CSS in the `<style>` block
3. Add JS logic — cache DOM element in `initializeElements()`, add to `elements` object
4. Bump the `app-version` meta tag
5. All JS must be ES5-compatible (no modern syntax)

### New weather data
- Open-Meteo API: add parameters to the existing URL in `fetchWeather()`
- Always use `&timeformat=unixtime` for time values to avoid timezone issues
- Parse with `new Date(timestamp * 1000)` for Unix timestamps

## Security

- Never commit `.env` files or secrets
- API keys are Cloudflare environment variables, not in code
- Validate auth on all endpoints except `/api/health`
- CORS origin configurable via `ALLOWED_ORIGIN` env var

## Documentation

Keep these files updated after structural changes:
- `README.md` — user-facing setup and usage
- `CLAUDE.md` — AI assistant project context
- `.claude/skills/` — skill instructions
