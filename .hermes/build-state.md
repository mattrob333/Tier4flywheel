# Build State: Tier4flywheel — Website + Advisor Audit Console

**Spec source:** README.md, designspec.md, copyrewrite.md, docs-internal/advisor-audit-amendment-plan.md
**Repo:** https://github.com/mattrob333/Tier4flywheel
**Workspace:** ~/Tier4flywheel
**Status:** 🏗️ Production live site + functional audit pipeline — Phases 3-5 pending

## Architecture: Two-Tier Build Loop
- Inner Loop (cron TBD) — every 10m: Check → Test → Advance → Repeat. Self-pauses both crons at a genuine stopping point.
- Outer Loop (cron TBD) — every 60m: active supervisor (audits + writes corrections + trivial fixes + escalation).

## Current State Assessment

### What's here (all production code, live on tier4intelligence.com):

**Public Site (13 components, fully built):**
- ✅ GSAP-animated "Midnight Luxe" landing page (Hero, Identity, Flywheel, StageCards, Philosophy, SocialProof, BeyondHomeServices, FAQ, CTASection, Footer)
- ✅ AI Readiness Audit public launcher component
- ✅ Chat widget with OpenAI integration
- ✅ Lead capture form
- ✅ llms.txt + llms-full.txt for AI search visibility
- ✅ Sitemap, robots.txt, og-image
- ✅ Full SEO metadata

**Advisor Console — Audit Pipeline (90KB page, 23 API files):**
- ✅ 6-step audit: Client → Questions → Discovery → Report → Readout → Proposal
- ✅ Three-layer report schema: client_report / advisor_intelligence / system_metadata
- ✅ Background report generation with polling (up to 9 min)
- ✅ Report validation + repair pass
- ✅ Economic impact extraction & editing (Phase 2 complete)
- ✅ Compact readout assistant JSON schema
- ✅ Proposal generation + follow-up email drafting
- ✅ Supabase persistence with migrations (3 migrations in order)
- ✅ Clerk auth + advisor password gate
- ✅ Admin dashboard with audit history
- ✅ Superuser visibility across all advisor audits
- ✅ 18 tests across 3 test files

**Infrastructure:**
- ✅ Vercel deployment with function configs
- ✅ CSP headers, HSTS, security headers
- ✅ Clerk auth integration
- ✅ Supabase service-role access
- ✅ Airtable lead capture fallback
- ✅ All env vars documented in .env.example

### What's pending (from amendment plan, Phases 3-5):

**Phase 3 — Economic UI + Readout Validation (NOT started):**
- ⬜ Economic Opportunity card on expanded audit rows in AdminAuditHistory
- ⬜ View/Edit Economics modal (editable variables → recalculated totals)
- ⬜ Wire `economic_validation` into readout assistant Card 3
- ⬜ Persist validation status to `audit_readouts` + `audit_economic_impacts`
- ⬜ `POST /api/audit-economic-validate` endpoint

**Phase 4 — Proposal Integration (NOT started):**
- ⬜ Value-case block in proposal schema (validated economics, directional labels, no ROI for low confidence)
- ⬜ Proposal schema: drop Pedigree-named `proposal_type` enum → neutral names
- ⬜ `audit-proposal.js`: pass full transcripts + validated economics + selected next step
- ⬜ Proposal UI: <Markdown> renderer with editable mode + value case display
- ⬜ Populate `audit_proposals` economic fields

**Phase 5 — Learning Loop (NOT started):**
- ⬜ Extend export with economic_impact, readout, proposal blocks
- ⬜ System Improvement Audit (net-new evaluation agent)
- ⬜ Evaluation Agent with metrics (Economic Capture Rate, Validation Rate, Value-Case Rate, conversion rates)
- ⬜ Dedicated endpoint set for evaluator

**Plus some loose ends:**
- ⬜ A few `audit-report.js` legacy synchronous path files still exist (cleanup — annotated @deprecated, safe to leave until Phases 3-5 verified live)

## Quality Gate
- `npm test` — 18 tests (node --test runner)
- `npm run lint` — ESLint
- `npm run build` — Vite build (must produce dist/)
- All currently passing based on last push

## Guardrails for this project
- **This is a live production site.** Never commit broken builds. Never push to master without `npm run build` passing.
- **Never expose OPENAI_API_KEY or CLERK_SECRET_KEY** in client-side code.
- **Preserve existing auth patterns** — advisor gate + Clerk. Don't weaken security.
- **Report schema changes must be backward-compatible.** Old saved audits in Supabase have the flat schema shape; the normalizer handles both.
- **No Pedigree/SKU names in client-facing output** — that's what the three-layer split is for.

## Open Issues / Blockers
- None — master is green (18/18 tests, build ✓). Phases 4.1–4.4 + 4.6 complete; Phase 4.5 (Proposal Markdown UI) next.

## Next Action
- **Phase 4.5: Proposal UI** — Phases 4.1–4.4 + 4.6 are complete (value-case prompt rules, value_case schema block, Pedigree enum → neutral names, economics passed into proposal prompt, economic fields persisted to audit_proposals). Next: 4.5, render the proposal with `<Markdown>` (react-markdown is already a dependency) instead of raw textarea, add an editable-mode toggle, and surface the value_case block in the UI.

## Pitfalls / Notes for Future Ticks
- This is the actual tier4intelligence.com — treat with care
- Phases 1-2 (clean report, three-layer schema, economic extraction, markdown rendering) are complete per the amendment plan
- react-markdown IS in package.json (the amendment plan doc was written before it was added)
- Economic impact migration IS applied
- The old synchronous audit-report.js path is dead code, now annotated @deprecated — don't delete until Phases 3-5 verified live
- All three Phase-0 course corrections are RESOLVED (commit d0ae3cb): master builds clean, parse-model fallback chain is correct, legacy files annotated

**Last Updated:** 2026-06-22 — Phase 4.1/4.2/4.3/4.4/4.6 shipped (value-case prompt + schema, Pedigree enum → neutral, economics in proposal prompt + persisted to audit_proposals); master green (18/18 tests); 4.5 Proposal Markdown UI next