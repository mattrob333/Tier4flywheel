# Tier4flywheel — Improvement Plan

## The Vision

This project is already a **live production site** (tier4intelligence.com) with a **working AI audit pipeline** for the Tier 4 Advisors team. The audit tool is functional through all 6 steps — it generates client reports with economic impact analysis, readout guides, proposals, and follow-ups.

The remaining work is about **polishing and completing the economic/proposal/value layers** so the audit tool becomes a full revenue engine:

1. **Phase 3** — Let advisors view, edit, and validate the economic opportunity numbers
2. **Phase 4** — Wire the validated economics into proposals with proper value-case language
3. **Phase 5** — Build the learning loop so the system improves over time

---

## Phase 3: Economic UI + Readout Validation

**Goal**: Advisors can see, edit, and validate the economic opportunity extracted from the discovery call.

### Tasks

1. **Economic Opportunity card on audit rows** (`src/components/AdminAuditHistory.jsx`)
   - Show annual cost, confidence, validation status, savings range per audit
   - View/Edit button, Add-to-Readout button, Include-in-Proposal button

2. **View/Edit Economics modal**
   - Editable variables → recalculated totals with ranges
   - Show formulas, evidence quotes, assumptions, missing inputs
   - Save revisions back to `audit_economic_impacts`

3. **Wire `economic_validation` into readout assistant**
   - Card 3 (Validate Economics) in the compact readout
   - Capture validation status (validated / revised / rejected)
   - Persist back via `POST /api/audit-economic-validate`

4. **Post-readout endpoint** `POST /api/audit-economic-validate`
   - Accepts readout transcript + validation results
   - Revises/confirms economic numbers
   - Stores to `audit_readouts` + `audit_economic_impacts`

### Acceptance
- Advisors can view economics on any audit with an extraction
- Economics modal is editable and recalculates
- Readout assistant Card 3 drives the validation conversation
- Validation status persists

---

## Phase 4: Proposal Integration

**Goal**: Proposals include validated economics, proper value-case language, and are rendered cleanly.

### Tasks

1. **Update `proposalPrompt` in `_advisorAuditPrompts.js`**
   - Value-Case rules: prefer validated economics, label directional estimates, no ROI language for low confidence, show simple math, ranges, editable pricing
   - Drop Pedigree-named `proposal_type` enum → neutral names

2. **Update `proposalSchema`**
   - Add `value_case` block with investment/payback ranges
   - Drop Pedigree `proposal_type` → neutral alternatives

3. **Update `audit-proposal.js`**
   - Pass discovery + readout transcripts + validated economics + selected next step
   - Populate `audit_proposals` economic fields

4. **Proposal UI in AdminAuditPage**
   - Render with `<Markdown>` (not raw textarea)
   - Editable mode toggle
   - Show value case block

5. **Update `audit-proposal.js` PATCH**
   - Allow updating value case after editing

### Acceptance
- Proposals include economics with proper value-case framing
- No Pedigree product names in client-facing proposal text
- Markdown rendered cleanly
- Advisors can edit the proposal

---

## Phase 5: Learning Loop

**Goal**: The system learns from completed audits to improve conversion and quality.

### Tasks

1. **Extend export on AdminAuditHistory**
   - Add economic_impact, readout, proposal blocks to `exportAll`/`fullAuditExport`

2. **System Improvement Audit** (net-new)
   - Endpoint that reviews completed audits in batch
   - Measures: Economic Capture Rate, Validation Rate, Value-Case Rate, conversion rates
   - Price-to-Problem-Cost Ratio analysis

3. **Evaluation Agent**
   - Scoring categories for audit quality
   - Trend tracking over time
   - Identifies areas where the prompts/process need improvement

4. **Dashboard metrics**
   - Summary stats on AdminHomePage showing pipeline performance

### Acceptance
- Advisors can see aggregate metrics
- Export captures the full audit lifecycle
- Evaluation identifies improvement areas

---

## Quick-Start Checklist

- [ ] `npm install && npm test && npm run build` passes on master
- [ ] `.hermes/build-state.md` + `.hermes/course-corrections.md` seeded
- [ ] Course corrections resolved (build verification, deprecated annotations, parse-model bug)
- [ ] Phase 3: Economic UI + validation endpoint
- [ ] Phase 4: Proposal integration with value case
- [ ] Phase 5: Learning loop metrics + evaluation
- [ ] Both crons created with real job IDs