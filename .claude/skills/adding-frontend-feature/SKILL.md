---
name: adding-frontend-feature
description: "Add a new UI feature to the FoxESS dashboard frontend. Use when building dashboard components, adding panels, implementing settings toggles, or when asked to modify public/index.html."
user-invocable: true
argument-hint: "[e.g. 'add battery health panel' or 'dark mode toggle']"
---

# Adding a Frontend Feature

The entire frontend is one file: `public/index.html`. Read the section you're extending first — the existing structure is the spec. The iOS 12 constraints in `CLAUDE.md` are mandatory for every line of JS you add.

## The rules

- **DOM elements** get cached in `initializeElements()` and added to the `elements` object.
- **User config** lives in the `config` object, persisted to localStorage; a new settings toggle must be wired in three places — the settings panel HTML, `loadSettings()`, and `saveSettings()`.
- **External data** fetches use `XMLHttpRequest` with `onreadystatechange`; Open-Meteo time data uses `&timeformat=unixtime` + `new Date(ts * 1000)`.
- **CSS follows the existing theme**: background `#1a1a2e`, cards `#16213e`, text `#e0e0e0`; accents green `#4ade80`, blue `#60a5fa`, yellow `#fbbf24`; existing class naming.
- **Bump `<meta name="app-version">`** (semver) as part of the change, not after.

## Validation before finishing

Grep the diff for iOS 12 breakers — each of these has shipped a blank screen before:

```
=>                      # arrow functions
\blet\b  \bconst\b      # in JS, not CSS
`                       # template literals
for.*of
```

Then **ask before committing/pushing**, and run `reflecting` if the change is significant.

## Related skills

- `adding-backend-feature` — the route feeding the new UI
- `reflecting` — doc sync afterwards
