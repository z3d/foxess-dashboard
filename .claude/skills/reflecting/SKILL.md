---
name: reflecting
description: "Review and update all project documentation after making changes. Use after completing features, restructuring code, or when documentation may be stale."
disable-model-invocation: true
user-invocable: true
argument-hint: "[summary of recent changes, or leave blank to auto-detect]"
---

# Reflecting — Update Project Documentation

After completing significant features or structural changes, review and update all project documentation.

## Steps

1. **Read current state** of all docs and source files:
   - `README.md`, `CLAUDE.md`, `AGENTS.md`
   - `wrangler.jsonc`, `src/worker.js` (scan routes), `public/index.html` (scan version + features)
   - All files in `.claude/skills/`

2. **Check README.md**:
   - Features list matches what's implemented
   - Project structure matches actual file tree
   - Environment variables table is complete
   - API endpoints table is complete
   - Setup instructions are accurate
   - No references to deleted files or old architecture

3. **Check CLAUDE.md**:
   - Quick Commands section is current
   - Architecture section matches actual structure
   - API Routes table matches `src/worker.js`
   - Environment variables table is complete
   - Common Gotchas section covers new patterns
   - External APIs section is current

4. **Check AGENTS.md**:
   - Code conventions match current patterns
   - Feature-adding instructions are accurate
   - Any new patterns or conventions documented

5. **Check skills** in `.claude/skills/`:
   - Frontend skill: UI patterns, color scheme, element caching still accurate
   - Backend skill: routing pattern, helper imports, caching still accurate
   - This skill: checklist still complete

6. **Check version**: Ensure `<meta name="app-version">` was bumped if index.html changed

7. **Cross-check consistency**: Ensure these are in sync across all docs:
   - API routes table (README.md, CLAUDE.md, backend skill)
   - Environment variables table (README.md, CLAUDE.md)
   - Project structure / file tree (README.md, CLAUDE.md)
   - iOS 12 constraints (CLAUDE.md, frontend skill)
   - Version bumping instructions (CLAUDE.md, frontend skill)

8. **Apply updates** to any files that are out of date

9. **Ask the user** if they want to commit and push the documentation updates
