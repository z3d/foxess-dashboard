---
name: reflecting
description: "Review and update all project documentation after making changes. Use after completing features, restructuring code, or when documentation may be stale."
disable-model-invocation: true
user-invocable: true
argument-hint: "[summary of recent changes, or leave blank to auto-detect]"
---

# Reflecting — Update Project Documentation

Read the current state first — `README.md`, `AGENTS.md`, `CLAUDE.md`, the skills, `wrangler.jsonc`, `src/worker.js` (scan routes), and `public/index.html` (version + features) — then fix what has drifted.

These facts must agree everywhere they appear; check each across its homes:

| Fact | Homes |
|---|---|
| API routes | `src/worker.js` (truth), README.md table |
| Environment variables | README.md, AGENTS.md |
| iOS 12 constraints | AGENTS.md (truth), frontend skill's reference to it |
| Version-bump rule | AGENTS.md, frontend skill |
| Worker patterns (auth, caching, helpers) | backend skill vs actual `worker.js` |

Also confirm `<meta name="app-version">` was bumped if `index.html` changed, and that nothing references deleted files or old architecture.

Apply the updates, then **ask the user** before committing and pushing.

## Related skills

- `adding-backend-feature`, `adding-frontend-feature` — the changes that trigger this pass
