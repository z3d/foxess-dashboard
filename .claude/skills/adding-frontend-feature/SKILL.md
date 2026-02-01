---
name: adding-frontend-feature
description: "Add a new UI feature to the FoxESS dashboard frontend. Use when building dashboard components, adding panels, implementing settings toggles, or when asked to modify public/index.html."
user-invocable: true
argument-hint: "[e.g. 'add battery health panel' or 'dark mode toggle']"
---

# Adding a Frontend Feature

You are adding a new feature to the FoxESS Battery Monitor dashboard. The entire frontend is a single file: `public/index.html`.

## Before Starting

1. Read `public/index.html` to understand the current structure
2. Identify where the new feature fits (header, stats grid, weather panel, settings, etc.)
3. Plan the changes needed: HTML, CSS, and JS

## iOS 12 Compatibility (MANDATORY)

All JavaScript in `public/index.html` MUST work on iOS 12 Safari:

- Use `var` — never `let` or `const`
- Use `function() {}` — never arrow functions `() => {}`
- Use string concatenation — never template literals
- Use indexed `for` loops — never `for...of`
- Use `XMLHttpRequest` — never `fetch()`
- No destructuring, spread, rest, optional chaining, nullish coalescing

## Implementation Steps

1. **Add HTML** in the appropriate section of the file
2. **Add CSS** in the `<style>` block, following existing patterns:
   - Dark theme: background `#1a1a2e`, cards `#16213e`, text `#e0e0e0`
   - Accent colors: green `#4ade80`, blue `#60a5fa`, yellow `#fbbf24`
   - Use existing class naming conventions
3. **Add JavaScript**:
   - Cache new DOM elements in `initializeElements()` and add to the `elements` object
   - Store any user config in the `config` object (persisted to localStorage)
   - If adding a settings toggle, add it to the settings panel HTML, `loadSettings()`, and `saveSettings()`
   - If fetching external data, use `XMLHttpRequest` with `onreadystatechange`
   - If using Open-Meteo time data, use `&timeformat=unixtime` and `new Date(timestamp * 1000)`
4. **Bump version**: Update `<meta name="app-version" content="X.Y.Z">` (semver)

## Validation Checklist

Before finishing, grep for these patterns that would break iOS 12:
- Arrow functions: `=>`
- Let/const: `\blet\b`, `\bconst\b` (in JS, not CSS)
- Template literals: backtick characters
- For...of: `for.*of`

## After Implementation

1. Ask the user if they want to commit and push
2. If committing, use a concise message with `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
3. Run `/reflect` to update documentation if the change is significant
