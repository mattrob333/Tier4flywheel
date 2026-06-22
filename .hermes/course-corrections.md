# Course Corrections — Outer Loop → Inner Loop

The OUTER loop appends prioritized directives here when it detects drift, guardrail violations, quality regressions, or off-task work. The INNER loop reads this FIRST every tick and resolves OPEN corrections as top priority before normal work.

**Protocol:**
- Outer APPENDS corrections as OPEN; never edits build-state.md (avoids write races).
- Inner addresses each OPEN item, then marks it RESOLVED (commit <sha>) and moves it to Resolved.
- Severity: BLOCKER (stop normal work, fix now) · HIGH (this tick) · MEDIUM (within 2 ticks) · LOW (when convenient)

---

## Open Corrections

### [HIGH] Verify master builds before any work — OPEN (Phase 0 audit)
**Problem:** No guarantee the current master branch is in a buildable/testable state. A broken build would break the live site on deploy.
**Required fix:** Run `npm install && npm test && npm run build` on current master. If it fails, fix it BEFORE any other work. This is the gate to all subsequent phases.
**Acceptance:** `npm run build` exits 0 and produces `dist/`.

### [MEDIUM] Legacy synchronous audit-report.js files — OPEN (Phase 0 audit)
**Problem:** The old synchronous path (`audit-report.js`, `audit-report-chunk.js`, `audit-report-evidence.js`) still exists as dead code. The live path uses the background job flow (`audit-report-start.js` → polling `audit-report-status.js`). Dead code is confusing.
**Required fix:** Assess each file. If truly unused, annotate as `@deprecated` with a comment pointing to the live path. Do NOT delete until Phases 3-5 work is verified on the live path.
**Acceptance:** Each file has a `@deprecated` header comment explaining the live replacement path.

### [MEDIUM] Parse-model bug — OPEN (Phase 0 audit)
**Problem:** `api/_advisorAuditServer.js:6` still defaults parse model to `gpt-5.4-mini` instead of falling back to `OPENAI_MODEL`.
**Required fix:** Change line to `const OPENAI_PARSE_MODEL = process.env.OPENAI_AUDIT_PARSE_MODEL || process.env.OPENAI_AUDIT_MODEL || 'gpt-5.5';`
**Acceptance:** The hardcoded `gpt-5.4-mini` fallback is removed.

---

## Resolved Corrections
_(none yet)_