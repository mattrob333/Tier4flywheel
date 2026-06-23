import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSystemMetrics, computeQualityScores } from '../api/audit-system-improvement.js';

test('computeSystemMetrics returns zeroed structure for empty input', () => {
  const result = computeSystemMetrics([]);
  assert.equal(result.total_audits, 0);
  assert.equal(result.economic_capture.rate, null);
  assert.equal(result.validation.rate, null);
  assert.equal(result.value_case.rate, null);
  assert.equal(result.price_to_problem_cost.median, null);
});

test('computeSystemMetrics computes economic capture rate', () => {
  const audits = [
    { economic_impact: { annual_cost_estimate: 50000 }, report: {} },
    { economic_impact_status: 'estimated', report: {} },
    { report: {} }, // no economic data
  ];
  const result = computeSystemMetrics(audits);
  assert.equal(result.total_audits, 3);
  assert.equal(result.economic_capture.count, 2);
  assert.equal(result.economic_capture.rate, Math.round((2 / 3) * 10000) / 10000);
});

test('computeSystemMetrics computes validation rate from readout fields', () => {
  const audits = [
    {
      readout: { economics_discussed: true, economics_validated: true, economics_revised: false },
      report: {},
    },
    {
      readout: { economics_discussed: true, economics_validated: true, economics_revised: true },
      report: {},
    },
    {
      readout: { economics_discussed: true, economics_validated: false, economics_revised: false },
      report: {},
    },
    { readout: { economics_discussed: false }, report: {} },
  ];
  const result = computeSystemMetrics(audits);
  assert.equal(result.validation.discussed, 3);
  assert.equal(result.validation.validated, 2);
  assert.equal(result.validation.revised, 1);
  assert.equal(result.validation.rate, Math.round((2 / 3) * 10000) / 10000);
});

test('computeSystemMetrics computes value-case rate from proposals', () => {
  const audits = [
    {
      proposal: { includes_value_case: true, proposal_json: { value_case: { headline: 'x' } } },
      report: {},
    },
    {
      proposal: { includes_value_case: true },
      report: {},
    },
    {
      proposal: { proposal_json: {} },
      report: {},
    },
    { report: {} }, // no proposal
  ];
  const result = computeSystemMetrics(audits);
  assert.equal(result.value_case.total_proposals, 3);
  assert.equal(result.value_case.proposals_with_value_case, 2);
  assert.equal(result.value_case.rate, Math.round((2 / 3) * 10000) / 10000);
});

test('computeSystemMetrics computes conversion rates', () => {
  const audits = [
    {
      readout: { readout_guide_json: '{"card":1}', proposal_requested: true },
      proposal: { proposal_text: 'draft' },
      report: {},
    },
    {
      readout: { readout_guide_json: '{"card":1}', proposal_requested: false },
      report: {},
    },
    { report: {} }, // no readout
  ];
  const result = computeSystemMetrics(audits);
  assert.equal(result.conversion.readout_reached, 2);
  assert.equal(result.conversion.proposal_generated, 1);
  assert.equal(result.conversion.proposal_requested, 1);
  assert.equal(result.conversion.proposal_rate, 0.5);
  assert.equal(result.conversion.request_rate, 0.5);
});

test('computeSystemMetrics computes price-to-problem-cost ratio', () => {
  const audits = [
    {
      economic_impact: { annual_cost_estimate: 100000 },
      proposal: { investment_low: 20000, investment_high: 40000 },
      report: {},
    },
    {
      economic_impact: { annual_cost_estimate: 50000 },
      proposal: { estimated_value: 15000 },
      report: {},
    },
    {
      economic_impact: { annual_cost_estimate: null },
      proposal: { investment_low: 10000 },
      report: {},
    },
  ];
  const result = computeSystemMetrics(audits);
  // Sample 1: investment midpoint = 30000, annual cost = 100000 → ratio 0.3
  // Sample 2: investment = 15000, annual cost = 50000 → ratio 0.3
  // Sample 3: no annual cost → excluded
  assert.equal(result.price_to_problem_cost.samples, 2);
  assert.equal(result.price_to_problem_cost.median, 0.3);
  assert.equal(result.price_to_problem_cost.mean, 0.3);
});

test('computeSystemMetrics builds sales stage breakdown', () => {
  const audits = [
    { report: { sales_stage: 'proposal_sent' } },
    { report: { sales_stage: 'proposal_sent' } },
    { report: { sales_stage: 'readout_done' } },
    { report: {} }, // defaults to not_started
  ];
  const result = computeSystemMetrics(audits);
  assert.deepEqual(result.sales_stage_breakdown, {
    proposal_sent: 2,
    readout_done: 1,
    not_started: 1,
  });
});

// --- computeQualityScores tests ---

test('computeQualityScores returns N/A grades for empty metrics', () => {
  const metrics = computeSystemMetrics([]);
  const scores = computeQualityScores(metrics);
  assert.equal(scores.overall_score, null);
  assert.equal(scores.overall_grade, 'N/A');
  assert.equal(scores.categories.prompt_effectiveness.grade, 'N/A');
  assert.equal(scores.improvement_priorities.length, 0);
});

test('computeQualityScores scores prompt effectiveness from economic capture rate', () => {
  const metrics = {
    total_audits: 10,
    economic_capture: { count: 8, rate: 0.8 },
    validation: { rate: null },
    value_case: { rate: null },
    conversion: { readout_reached: 0, proposal_rate: null, request_rate: null },
  };
  const scores = computeQualityScores(metrics);
  assert.equal(scores.categories.prompt_effectiveness.score, 80);
  assert.equal(scores.categories.prompt_effectiveness.grade, 'B');
});

test('computeQualityScores scores economic accuracy from validation rate', () => {
  const metrics = {
    total_audits: 10,
    economic_capture: { count: 10, rate: 1.0 },
    validation: { rate: 0.9 },
    value_case: { rate: null },
    conversion: { readout_reached: 0, proposal_rate: null, request_rate: null },
  };
  const scores = computeQualityScores(metrics);
  assert.equal(scores.categories.economic_accuracy.score, 90);
  assert.equal(scores.categories.economic_accuracy.grade, 'A');
});

test('computeQualityScores identifies improvement priorities below 60', () => {
  const metrics = {
    total_audits: 10,
    economic_capture: { count: 3, rate: 0.3 },
    validation: { rate: 0.95 },
    value_case: { rate: 0.4 },
    conversion: { readout_reached: 5, proposal_rate: 0.2, request_rate: null },
  };
  const scores = computeQualityScores(metrics);
  // prompt_effectiveness = 30 (F), value_case_quality = 40 (F), conversion_health = 20 (F)
  // economic_accuracy = 95 (A)
  const priorityKeys = scores.improvement_priorities.map((p) => p.key);
  assert.ok(priorityKeys.includes('prompt_effectiveness'));
  assert.ok(priorityKeys.includes('value_case_quality'));
  assert.ok(priorityKeys.includes('conversion_health'));
  assert.ok(!priorityKeys.includes('economic_accuracy'));
  // Sorted ascending by score
  assert.ok(scores.improvement_priorities[0].score <= scores.improvement_priorities[1].score);
});

test('computeQualityScores computes overall score as mean of valid categories', () => {
  const metrics = {
    total_audits: 10,
    economic_capture: { count: 10, rate: 1.0 },
    validation: { rate: 0.8 },
    value_case: { rate: 0.6 },
    conversion: { readout_reached: 10, proposal_rate: 0.5, request_rate: null },
  };
  const scores = computeQualityScores(metrics);
  // Scores: 100, 80, 60, 50 + report_completeness=100 → mean = (100+80+60+50+100)/5 = 78
  assert.equal(scores.overall_score, 78);
  assert.equal(scores.overall_grade, 'C');
});
