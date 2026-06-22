# Course Corrections — Outer Loop → Inner Loop

The OUTER loop appends prioritized directives here when it detects drift, guardrail violations, quality regressions, or off-task work. The INNER loop reads this FIRST every tick and resolves OPEN corrections as top priority before normal work.

**Protocol:**
- Outer APPENDS corrections as OPEN; never edits build-state.md (avoids write races).
- Inner addresses each OPEN item, then marks it RESOLVED (commit <sha>) and moves it to Resolved.
- Severity: BLOCKER (stop normal work, fix now) · HIGH (this tick) · MEDIUM (within 2 ticks) · LOW (when convenient)

---

## Open Corrections

_(none — all cleared as of 2026-06-22)_

---

## Resolved Corrections

### [HIGH] Verify master builds before any work — RESOLVED (d0ae3cb)
**Outcome:** On current master, `npm install` completes, `npm test` passes 16/16, and `npm run build` produces `dist/` (exit 0, built in ~3.2s). Gate satisfied.

### [MEDIUM] Legacy synchronous audit-report.js files — RESOLVED (d0ae3cb)
**Outcome:** Added `@deprecated` JSDoc header comments to `api/audit-report.js`, `api/audit-report-chunk.js`, and `api/audit-report-evidence.js`. Each comment names the live replacement path (`audit-report-start.js` → `audit-report-status.js`) and notes the client only references the async endpoints. Files retained (not deleted) until Phases 3-5 are verified on the live path, per the correction's instructions.

### [MEDIUM] Parse-model bug — RESOLVED (d0ae3cb)
**Outcome:** Verified `api/_advisorAuditServer.js:6` already reads `const OPENAI_PARSE_MODEL = process.env.OPENAI_AUDIT_PARSE_MODEL || process.env.OPENAI_AUDIT_CHUNK_MODEL || OPENAI_MODEL;` where `OPENAI_MODEL = process.env.OPENAI_AUDIT_MODEL || 'gpt-5.5'`. A repo-wide search for `gpt-5.4-mini` returns zero matches. The hardcoded fallback was already removed on master; the correction's intent (no hardcoded `gpt-5.4-mini`) is satisfied.
