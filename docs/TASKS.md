# Task Board: Tier4flywheel — Audit Tool Completion

## Phase 3: Economic UI + Readout Validation

- [x] **3.1** Verify master builds and tests pass (gate for all work) — 16/16 tests, build ✓
- [x] **3.2** Fix parse-model bug in `_advisorAuditServer.js` (gpt-5.4-mini → model fallback) — already fixed on master; no gpt-5.4-mini anywhere
- [x] **3.3** Annotate deprecated legacy files (audit-report.js, chunk, evidence) — @deprecated headers added (d0ae3cb)
- [ ] **3.4** Economic Opportunity card component for AdminAuditHistory rows
- [ ] **3.5** View/Edit Economics modal with editable variables + recalculated totals
- [ ] **3.6** Wire economic_validation into readout assistant Card 3
- [ ] **3.7** `POST /api/audit-economic-validate` endpoint
- [ ] **3.8** Persist validation status to `audit_readouts` + `audit_economic_impacts`
- [ ] **3.9** Update vercel.json with new function entries

## Phase 4: Proposal Integration

- [ ] **4.1** Update proposalPrompt with value-case rules
- [ ] **4.2** Update proposalSchema with value_case block
- [ ] **4.3** Drop Pedigree-named proposal_type → neutral names
- [ ] **4.4** Update audit-proposal.js to pass full context + economics
- [ ] **4.5** Render proposal with <Markdown> + editable mode
- [ ] **4.6** Populate audit_proposals economic fields on PATCH

## Phase 5: Learning Loop

- [ ] **5.1** Extend export with economic/readout/proposal blocks
- [ ] **5.2** System Improvement Audit endpoint (batch review)
- [ ] **5.3** Evaluation Agent scoring categories
- [ ] **5.4** Dashboard metrics on AdminHomePage
- [ ] **5.5** Trend tracking over time

## Phase 0 completed
- [x] Repo cloned and analyzed
- [x] Full structural reconnaissance completed
- [x] Amendment plan read and understood (Phases 1-2 done, 3-5 pending)
- [x] Build state initialized
- [x] Course corrections seeded