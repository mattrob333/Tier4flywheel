# Task Board: Tier4flywheel — Audit Tool Completion

## Phase 3: Economic UI + Readout Validation

- [x] **3.1** Verify master builds and tests pass (gate for all work) — 16/16 tests, build ✓
- [x] **3.2** Fix parse-model bug in `_advisorAuditServer.js` (gpt-5.4-mini → model fallback) — already fixed on master; no gpt-5.4-mini anywhere
- [x] **3.3** Annotate deprecated legacy files (audit-report.js, chunk, evidence) — @deprecated headers added (d0ae3cb)
- [x] **3.4** Economic Opportunity card component for AdminAuditHistory rows — shipped 771a503
- [x] **3.5** View/Edit Economics modal with editable variables + recalculated totals — shipped ce7d347
- [x] **3.6** Wire economic_validation into readout assistant Card 3 — shipped (EconomicValidationControls in Card 3, POSTs to /api/audit-economic-validate)
- [x] **3.7** `POST /api/audit-economic-validate` endpoint — shipped (audit-economic-validate.js + validateEconomicImpact store fn + vercel.json entry)
- [x] **3.8** Persist validation status to `audit_readouts` + `audit_economic_impacts` — shipped with 3.7 (validateEconomicImpact writes both tables + advisor_audits lifecycle)
- [x] **3.9** Update vercel.json with new function entries — audit-economic-validate.js added

## Phase 4: Proposal Integration

- [x] **4.1** Update proposalPrompt with value-case rules — shipped (validated economics preference, directional labels, no ROI for low confidence, simple math, editable pricing)
- [x] **4.2** Update proposalSchema with value_case block — shipped (headline, confidence, cost/savings/investment/payback ranges, basis, directional_note)
- [x] **4.3** Drop Pedigree-named proposal_type → neutral names — shipped (enum: 'Agent Governance Demo Proposal'; NEXT_STEPS: 'Agent Governance Demo')
- [x] **4.4** Update audit-proposal.js to pass full context + economics — shipped (economic_impact + readout validation fields passed to prompt; prompt version bumped to proposal_v2)
- [x] **4.5** Render proposal with <Markdown> + editable mode — shipped (Markdown render + Edit/Preview toggle already present; added ValueCaseCard surfacing structured value_case block)
- [x] **4.6** Populate audit_proposals economic fields on PATCH — shipped (proposalRowFromPayload stores economic_impact_id, includes_value_case, investment/payback ranges, estimated_value)

## Phase 5: Learning Loop

- [x] **5.1** Extend export with economic/readout/proposal blocks — shipped 8cae084 (economicImpactExportBlock + proposalExportBlock + readoutExportBlock, wired into both fullAuditExport and exportAll)
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