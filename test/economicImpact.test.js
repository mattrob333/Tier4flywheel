import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toNumber,
  formatMoney,
  economicRowFromExtraction,
  clientEconomicFromRow,
  economicSummaryText,
  auditEconomicFields,
} from '../api/_economicImpact.js';

test('toNumber parses numbers and rejects junk', () => {
  assert.equal(toNumber('312000'), 312000);
  assert.equal(toNumber(312000), 312000);
  assert.equal(toNumber(''), null);
  assert.equal(toNumber(null), null);
  assert.equal(toNumber('not a number'), null);
});

test('formatMoney formats USD and blanks empty', () => {
  assert.equal(formatMoney(312000), '$312,000');
  assert.equal(formatMoney(null), '');
});

const extraction = {
  status: 'estimated',
  currency: 'USD',
  confidence: 'Medium',
  annual_cost_estimate: 312000,
  annual_savings_low: 93600,
  annual_savings_high: 156000,
  calculation_basis: '15 advisors x 4 hours x $100 x 52 weeks.',
  formula: '15 x 4 x 100 x 52 = 312000',
  improvement_target: '30% to 50% reduction',
  cost_drivers: ['Manual knowledge search'],
  inputs: [{ label: 'Advisors', value: '15', source: 'client_stated' }],
  assumptions: ['Loaded cost is approximate.'],
  missing_inputs: ['Onboarding delay cost'],
  evidence_quotes: ['We spend hours digging for old work.'],
  validation_question: 'Does $312,000 per year feel right?',
  suggested_follow_up_questions: ['How many people are affected?'],
};

test('economicRowFromExtraction maps fields and packs jsonb', () => {
  const row = economicRowFromExtraction(extraction, {
    auditId: 'a1',
    advisorId: 'u1',
    clientName: 'Tier4',
    auditTypeKey: 'discovery',
  });
  assert.equal(row.audit_id, 'a1');
  assert.equal(row.advisor_id, 'u1');
  assert.equal(row.status, 'estimated');
  assert.equal(row.annual_cost_estimate, 312000);
  assert.equal(row.formulas.formula, '15 x 4 x 100 x 52 = 312000');
  assert.deepEqual(row.variables.cost_drivers, ['Manual knowledge search']);
  // validation_question leads the questions list, follow-ups appended.
  assert.equal(row.validation_questions[0], 'Does $312,000 per year feel right?');
  assert.equal(row.validation_questions[1], 'How many people are affected?');
});

test('insufficient data does not invent an estimate', () => {
  const row = economicRowFromExtraction(
    { status: 'insufficient_data', annual_cost_estimate: null, suggested_follow_up_questions: ['How many people?'] },
    { auditId: 'a1', advisorId: 'u1' },
  );
  assert.equal(row.status, 'insufficient_data');
  assert.equal(row.annual_cost_estimate, null);
  assert.equal(economicSummaryText(row), 'Economic impact not yet quantified.');
});

test('clientEconomicFromRow round-trips a stored row into UI shape', () => {
  const row = economicRowFromExtraction(extraction, { auditId: 'a1', advisorId: 'u1' });
  const client = clientEconomicFromRow(row);
  assert.equal(client.annual_cost_estimate, 312000);
  assert.equal(client.formula, '15 x 4 x 100 x 52 = 312000');
  assert.equal(client.improvement_target, '30% to 50% reduction');
  assert.equal(client.validation_question, 'Does $312,000 per year feel right?');
  assert.deepEqual(client.cost_drivers, ['Manual knowledge search']);
});

test('auditEconomicFields denormalizes a summary', () => {
  const row = economicRowFromExtraction(extraction, { auditId: 'a1', advisorId: 'u1' });
  const fields = auditEconomicFields(row);
  assert.equal(fields.economic_annual_cost_estimate, 312000);
  assert.equal(fields.economic_confidence, 'Medium');
  assert.equal(fields.economic_summary, '$312,000 / year estimated (Medium confidence)');
});
