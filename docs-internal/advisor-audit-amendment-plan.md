# Implementation Plan — Advisor Audit Amendment

> Clean client report · Compact readout assistant · Economic Opportunity layer
>
> Branch: `claude/audit-economic-layer` (based on `origin/master` @ `03647f7`)
> Status: Phase 1 IMPLEMENTED (clean client report, three-layer schema, compact
> readout assistant, markdown rendering, parse-model bugfix). Phases 2-5 pending.

This plan maps the PRD amendment onto the **actual** current codebase. File paths and
line numbers below reflect the live `master` state so each task is concrete.

---

## 0. Current-state facts the plan must respect

1. **Reports run as background jobs.** The live path is
   `src/pages/AdminAuditPage.jsx → /api/audit-report-start.js → /api/audit-report-status.js`,
   polling every 3s for up to 9 min. The old synchronous `api/audit-report.js` and the
   chunk/evidence helpers (`audit-report-chunk.js`, `audit-report-evidence.js`) still exist.
   The schema split and economic section must flow through the **background** path and its
   repair pass, not just `audit-report.js`.
2. **Pedigree is structurally embedded** in five places that must change together:
   - `api/_advisorAuditPrompts.js`: `reportSchema.pedigree_fit` (object), the
     `internal_solution_mapping` enum (`Pedigree Discover/Govern/Enforce`), `reportPrompt`,
     `reportFromEvidencePrompt`, `reportRepairPrompt`, `readoutGuidePrompt`/`readoutGuideSchema`
     (`offer_fit_questions` mentions "Pedigree demo"), and `proposalSchema.proposal_type` enum
     (`Pedigree Demo / Agent Governance Proposal`).
   - `api/_advisorAuditValidation.js`: `validateAdvisorReport` **requires** `pedigree_fit`
     (lines ~121-139) and `ai_use_case_governance_signal`.
   - `src/pages/AdminAuditPage.jsx`: the `Report` component renders a **"Pedigree Fit"**
     section (~965-980) and a recommendations table column for `internal_solution_mapping`.
   - `api/_readoutProposalText.js`: markdown builders surface these fields.
   - `README.md`: "Report Quality Guardrails" lists "Pedigree fit" as a required field.
3. **No markdown renderer.** `package.json` has no react-markdown/marked. Readout guide is
   shown as raw text in `.t4-emailbox`; proposal in a raw `<textarea>`.
4. **Data model.** Supabase tables: `advisor_profiles`, `advisor_audits`, `audit_readouts`,
   `audit_proposals` (see `supabase/migrations/`). Store helpers in `api/_advisorAuditStore.js`.
   Report JSON is stored whole in `advisor_audits.report` (jsonb).
5. **Export / learning loop** lives in `src/components/AdminAuditHistory.jsx` (`exportAll`,
   `fullAuditExport`) — there is **no** server-side "system improvement audit" or evaluation
   agent yet. PRD Parts 9-10 are net-new and should be scoped as future work, not Phase 1.
6. **Lingering bug:** `api/_advisorAuditServer.js:6` still defaults the parse model to
   `gpt-5.4-mini`. Fold the one-line fix (`|| OPENAI_MODEL`) into Phase 1.

---

## 1. Backward-compatibility strategy (decision that gates everything)

The report schema changes from a flat object (`execSummary`, `pedigree_fit`, `domains`, …)
to a nested `{ client_report, advisor_intelligence, system_metadata }`. Existing saved audits
in `advisor_audits.report` have the **old flat shape**.

**Decision: additive + adapter, not destructive.**
- New reports are written in the nested shape.
- Introduce a single normalizer `normalizeReport(raw)` (new file `src/lib/reportShape.js`,
  mirrored server-side if needed) that accepts **either** shape and returns the nested shape.
  Old flat reports map to `client_report` (minus `pedigree_fit`, which moves to
  `advisor_intelligence` when rendering old data), so historical audits still open.
- The `Report` UI component reads only `report.client_report`. The advisor-intelligence panel
  reads `report.advisor_intelligence`. Both go through `normalizeReport`.

This avoids a data migration and keeps `/admin/audit?auditId=…` working for old records.

---

## 2. Phase plan (matches PRD Part 13, sequenced for safe shipping)

### Phase 1 — Clean client report + compact readout + markdown rendering

**Goal:** product-neutral client report, three-layer schema, compact readout cards, no raw markdown in UI.

**Schema (`api/_advisorAuditPrompts.js`)**
- Replace `reportSchema` with nested `client_report` / `advisor_intelligence` / `system_metadata`:
  - `client_report`: `executive_summary`, `business_risk`, `economic_opportunity` (Phase 2 fills
    this; in Phase 1 allow it to be `null`/insufficient), `scorecard` (the 5 domains),
    `findings` (top findings + per-domain), `recommendations` (no product language in titles),
    `roadmap`, `next_step_options`, `closing`.
  - `advisor_intelligence`: `next_step_signals[]`, `proposal_type_suggestion`,
    `prd_readiness`, `objections_to_explore[]`, `internal_solution_mapping[]`
    (the ONLY place Pedigree/SKU names may appear — generic signal names preferred).
  - `system_metadata`: `prompt_versions{}`, `quality_flags[]`, `economic_capture_status`,
    `conversion_fields{}`.
  - Keep OpenAI strict-mode constraints consistent with current schema (all props required,
    `additionalProperties:false`). Note: nested optional objects need `type:["object","null"]`
    or a sentinel, since strict mode requires every key present.
- Remove `pedigree_fit` from client-facing output entirely. Rename
  `ai_use_case_governance_signal` content into generic client language inside findings/recs;
  keep the governance *signal* only in `advisor_intelligence`.

**Prompts (`api/_advisorAuditPrompts.js`)**
- `reportPrompt` + `reportFromEvidencePrompt` + `reportRepairPrompt`: add the PRD rule verbatim:
  > "Do not include Pedigree, internal product names, SKU names, or demo recommendations in the
  > client-facing report. If the transcript shows a possible need for AI governance, describe it
  > generically as AI use case tracking, ownership, data access visibility, or a lightweight AI
  > operating model. Put any internal product mapping only in advisor_intelligence.internal_solution_mapping."
- Replace `readoutGuidePrompt` with the compact assistant prompt (PRD Part 2) and replace
  `readoutGuideSchema` with the compact JSON schema: `opening_script`, `conversation_goal`,
  `confirm_report_questions[]`, `economic_validation{estimated_annual_cost, validation_script,
  questions[]}`, `priority_questions[]`, `next_step_options[]`, `buying_signal_checklist[]`,
  `objection_questions[]`, `closing_script`, `optional_deep_dive_questions[]`.

**Validation (`api/_advisorAuditValidation.js`)**
- Remove the `pedigree_fit` required-field checks.
- Add a **client-cleanliness** check: error if any `client_report.*` string matches
  `/\b(Pedigree|SKU|Tier 4 Discover|Govern|Enforce)\b/i`. Keep the recommendation-title
  product-language guard, now scoped to `client_report.recommendations`.
- Re-point all field paths to the nested shape (use the normalizer).

**UI (`src/pages/AdminAuditPage.jsx`)**
- Update `STEPS` labels to PRD: `['Client','Questions','Discovery','Report','Readout','Proposal']`
  (already matches; relabel step 3 copy from "Transcript" to "Discovery" where shown).
- `Report` component: render `report.client_report` only. **Delete the Pedigree Fit block
  (~965-980).** Add a collapsible **"Advisor Intelligence (internal)"** panel rendering
  `report.advisor_intelligence`, visibly marked internal and excluded from export/PDF.
- Add Economic Opportunity render slot in the report (filled in Phase 2).
- Replace the raw readout guide text block with **structured cards** (Open / Confirm /
  Validate Economics / Prioritize / Capture Signals / Close) driven by the new JSON.
  Two-pane layout: left = client report, right = readout assistant cards.
- Add a markdown renderer for any remaining markdown (proposal preview, export preview):
  add `react-markdown` to `package.json` and a small `<Markdown>` wrapper with app typography.
  Default views stay concise/collapsible; markdown only for download/export.

**Markdown builders (`api/_readoutProposalText.js`)**
- `buildReadoutGuideText` rewritten for the compact schema (used for download/export only).
- Strip Pedigree from client-facing report markdown; keep it only in an internal export.

**Bug fold-in (`api/_advisorAuditServer.js:6`)**
- `const OPENAI_PARSE_MODEL = … || OPENAI_MODEL;` (drop `'gpt-5.4-mini'` fallback).

**Acceptance (PRD Part 12, items 1-2, 6-10):** client report has no Pedigree/SKU; readout is
compact cards; no raw markdown visible.

---

### Phase 2 — Economic extraction + report section

**DB (`supabase/migrations/<ts>_economic_impact.sql`)**
- New table `audit_economic_impacts` (full DDL from PRD Part 4) with RLS scoped to `advisor_id`
  mirroring `audit_readouts`.
- `alter table advisor_audits add column …` economic denormalized fields.
- `alter table audit_readouts add column …` economics-discussed/validated fields.
- `alter table audit_proposals add column …` economic_impact_id + value-case fields.
- Also update `supabase/advisor_audit_schema.sql` (the consolidated schema) to match.

**Store (`api/_advisorAuditStore.js`)**
- Add `saveEconomicImpact`, `getEconomicImpact(auditId)`, `updateEconomicImpact(id, …)` and
  denormalization onto `advisor_audits` (mirror the `saveAuditReadout`/`patchAuditLifecycle`
  pattern). Distinguish `source` and `status` enums from the PRD.

**Endpoints**
- `POST /api/audit-economic-extract.js` — input `{audit_id}`; uses research + questions +
  discovery transcript (+ report if present); returns structured economic JSON with
  client-stated vs advisor-calculated vs AI-inferred vs missing; stores a row + denormalizes.
- `PATCH /api/audit-economic-impact/[id].js` — advisor edits assumptions & recalculates.
- `GET /api/audit-economic-impact/[audit_id].js` — latest economics for an audit.
- (Phase 3/4) `POST /api/audit-economic-validate.js` — uses readout transcript to validate/revise.

**Prompts**
- Question generation (`researchPrompt`): add the PRD "3 to 5 business impact questions … not a
  finance interrogation" guidance.
- Report prompt: add the "Economic Opportunity Assessment … never invent numbers, always show the
  formula, say it was not fully quantified when evidence is thin" guidance, and have it emit
  `client_report.economic_opportunity` when evidence exists.
- New economic-extraction prompt + strict JSON schema (variables, formulas, evidence_quotes,
  assumptions, missing_inputs, validation_questions, confidence).

**UI**
- Render the Economic Opportunity Assessment section in the client report (estimate, basis,
  drivers, confidence, improvement range, recaptured value, assumptions, missing inputs,
  validation question). When insufficient: show the "not fully quantified" block + follow-ups.
- "Extract Economic Opportunity" action on the Discovery/Report step.

**Safeguards (PRD Part 11):** never invent numbers; always show formula; separate
client-stated vs assumptions; advisor must review before proposal; ranges, no guarantees.

---

### Phase 3 — Economic UI + readout validation

- Economic Opportunity card on expanded audit rows (`src/components/AdminAuditHistory.jsx`):
  annual cost, confidence, validation status, savings range, View/Edit, Add-to-Readout,
  Include-in-Proposal.
- View/Edit Economics modal (editable variables → recalculated totals, ranges).
- Wire `economic_validation` into the readout assistant card (Card 3) and persist validation
  status/revised numbers to `audit_readouts` + `audit_economic_impacts` via
  `POST /api/audit-economic-validate`.
- Readout outcome fields already partly exist on `audit_readouts`; add economics-validated/revised.

### Phase 4 — Proposal integration

- `proposalPrompt`: add the PRD Value-Case rules (prefer validated economics; label directional;
  no ROI language for low confidence; show simple math; ranges; editable pricing).
- `proposalSchema`: add `value_case` block + investment/payback ranges; drop the Pedigree-named
  `proposal_type` enum value (rename to neutral, e.g. "Agent Governance Proposal").
- `audit-proposal.js`: pass discovery + readout transcripts + validated economics + selected
  next step; populate `audit_proposals` economic fields.
- UI: render proposal with `<Markdown>` (not raw textarea) with an editable mode; show value case.

### Phase 5 — Learning loop (scope as follow-up)

- Extend `exportAll`/`fullAuditExport` (`AdminAuditHistory.jsx`) with the PRD `economic_impact`,
  `readout`, `proposal` export blocks.
- Net-new "System Improvement Audit" + "Evaluation Agent" (PRD Parts 9-10): define metrics
  (Economic Capture Rate, Validation Rate, Value-Case Rate, conversion rates,
  Price-to-Problem-Cost Ratio) and evaluator scoring categories. Recommend a separate design
  doc + endpoint set; do not block Phases 1-4 on this.

---

## 3. New / changed files at a glance

| Area | Files |
|---|---|
| Schema/prompts | `api/_advisorAuditPrompts.js` |
| Validation | `api/_advisorAuditValidation.js` |
| Server model fix + econ prompt host | `api/_advisorAuditServer.js` |
| Report background flow | `api/audit-report-start.js`, `api/audit-report-status.js` |
| Markdown builders | `api/_readoutProposalText.js` |
| Store | `api/_advisorAuditStore.js` |
| New endpoints | `api/audit-economic-extract.js`, `api/audit-economic-impact/[id].js`, `api/audit-economic-impact/[audit_id].js`, `api/audit-economic-validate.js` |
| DB | `supabase/migrations/<ts>_economic_impact.sql`, `supabase/advisor_audit_schema.sql` |
| UI | `src/pages/AdminAuditPage.jsx`, `src/components/AdminAuditHistory.jsx`, new `src/lib/reportShape.js`, new readout/economic card components |
| Deps | `package.json` (+ `react-markdown`) |
| Config | `vercel.json` (function entries for new endpoints) |
| Docs | `README.md` guardrails section |

---

## 4. Risks & open decisions (need a call before Phase 1 code)

1. **Report shape back-compat** — recommend the adapter approach in §1 (no data migration).
2. **Markdown lib** — recommend adding `react-markdown` for proposal/export preview while
   readout/report go fully structured. Alternative: keep zero-dependency and hand-render.
3. **Economic trigger** — recommend an advisor-clicked "Extract Economic Opportunity" button
   (not fully automatic) so advisors review before it lands in the client report.
4. **Pedigree in `internal_solution_mapping`** — PRD says map to Pedigree only in a hidden field;
   recommend keeping a free-text internal mapping but defaulting prompts to generic signal names.
5. **Phases 9-10 (improvement engine/evaluator)** — recommend a separate follow-up effort.
