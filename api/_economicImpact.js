// Pure helpers for the Economic Opportunity layer. No network or env access,
// so these are unit-tested directly (see test/economicImpact.test.js).

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatMoney(value, currency = 'USD') {
  const num = toNumber(value);
  if (num === null) return '';
  const symbol = currency === 'USD' ? '$' : '';
  return `${symbol}${num.toLocaleString('en-US')}`;
}

function arr(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined && item !== '') : [];
}

// Maps the LLM extraction JSON to an audit_economic_impacts row.
export function economicRowFromExtraction(extraction, ctx = {}) {
  const e = extraction || {};
  const status = e.status === 'insufficient_data' ? 'insufficient_data' : 'estimated';
  const validationQuestions = [e.validation_question, ...arr(e.suggested_follow_up_questions)].filter(Boolean);

  return {
    audit_id: ctx.auditId || null,
    readout_id: ctx.readoutId || null,
    advisor_id: ctx.advisorId || null,
    client_name: ctx.clientName || null,
    audit_type_key: ctx.auditTypeKey || null,
    source: ctx.source || 'discovery_transcript',
    status,
    currency: e.currency || 'USD',
    annual_cost_estimate: toNumber(e.annual_cost_estimate),
    annual_savings_low: toNumber(e.annual_savings_low),
    annual_savings_high: toNumber(e.annual_savings_high),
    confidence: e.confidence || null,
    variables: {
      inputs: arr(e.inputs),
      cost_drivers: arr(e.cost_drivers),
      improvement_target: e.improvement_target || '',
    },
    formulas: {
      formula: e.formula || '',
      calculation_basis: e.calculation_basis || '',
    },
    evidence_quotes: arr(e.evidence_quotes),
    assumptions: arr(e.assumptions),
    missing_inputs: arr(e.missing_inputs),
    validation_questions: validationQuestions,
    updated_at: new Date().toISOString(),
  };
}

// Builds the client-facing economic_opportunity object the report UI renders,
// from a stored audit_economic_impacts row.
export function clientEconomicFromRow(row) {
  if (!row) return null;
  const variables = row.variables || {};
  const formulas = row.formulas || {};
  const questions = arr(row.validation_questions);

  return {
    status: row.status || 'estimated',
    currency: row.currency || 'USD',
    annual_cost_estimate: toNumber(row.annual_cost_estimate),
    annual_savings_low: toNumber(row.annual_savings_low),
    annual_savings_high: toNumber(row.annual_savings_high),
    confidence: row.confidence || '',
    calculation_basis: formulas.calculation_basis || '',
    formula: formulas.formula || '',
    improvement_target: variables.improvement_target || '',
    cost_drivers: arr(variables.cost_drivers),
    inputs: arr(variables.inputs),
    assumptions: arr(row.assumptions),
    missing_inputs: arr(row.missing_inputs),
    evidence_quotes: arr(row.evidence_quotes),
    validation_question: questions[0] || '',
    suggested_follow_up_questions: questions,
  };
}

export function economicSummaryText(row) {
  if (!row) return '';
  if (row.status === 'insufficient_data' || row.annual_cost_estimate === null || row.annual_cost_estimate === undefined) {
    return 'Economic impact not yet quantified.';
  }
  const amount = formatMoney(row.annual_cost_estimate, row.currency);
  const confidence = row.confidence ? ` (${row.confidence} confidence)` : '';
  return `${amount} / year estimated${confidence}`;
}

// Denormalized fields written back onto advisor_audits.
export function auditEconomicFields(row) {
  return {
    economic_impact_status: row?.status || null,
    economic_annual_cost_estimate: toNumber(row?.annual_cost_estimate),
    economic_confidence: row?.confidence || null,
    economic_summary: economicSummaryText(row),
  };
}

// Maps a readout Card 3 validation_status to the boolean + status fields written
// onto audit_readouts and advisor_audits. Pure helper so it can be unit-tested.
//   'validated' -> economics_validated=true, economics_revised=false
//   'revised'   -> economics_validated=true, economics_revised=true
//   'rejected'  -> economics_validated=false, economics_revised=false
const VALIDATION_STATUSES = new Set(['validated', 'revised', 'rejected']);

export function isValidValidationStatus(status) {
  return VALIDATION_STATUSES.has(status);
}

export function validationOutcomeFields(validationStatus) {
  if (!VALIDATION_STATUSES.has(validationStatus)) return null;
  return {
    economics_discussed: true,
    economics_validated: validationStatus !== 'rejected',
    economics_revised: validationStatus === 'revised',
    economic_validated: validationStatus !== 'rejected',
  };
}
