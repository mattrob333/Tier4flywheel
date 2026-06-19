import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReport } from '../src/lib/reportShape.js';

test('normalizes a new three-layer report and aliases legacy field names', () => {
  const raw = {
    client_report: {
      overall: 3.2,
      band: 'Ready',
      executive_summary: 'Summary text.',
      top_findings: ['a', 'b', 'c'],
      scorecard: [{ name: 'Processes', score: 3 }],
      recommendations: [],
      economic_opportunity: { status: 'estimated', annual_cost_estimate: 312000 },
    },
    advisor_intelligence: { ai_governance_signal: 'internal note' },
    system_metadata: { economic_capture_status: 'not_assessed' },
  };
  const norm = normalizeReport(raw);
  assert.equal(norm.isGeo, false);
  assert.equal(norm.client.execSummary, 'Summary text.');
  assert.deepEqual(norm.client.topFindings, ['a', 'b', 'c']);
  assert.equal(norm.client.domains.length, 1);
  assert.equal(norm.advisor.ai_governance_signal, 'internal note');
  assert.equal(norm.economic.annual_cost_estimate, 312000);
});

test('legacy flat report moves pedigree out of the client layer', () => {
  const raw = {
    overall: 2.5,
    band: 'Aware',
    execSummary: 'Legacy summary.',
    topFindings: ['x'],
    domains: [{ name: 'Data', score: 2 }],
    ai_use_case_governance_signal: 'governance note',
    pedigree_fit: { fit_level: 'Light', reason: 'maybe' },
    recommendations: [{ title: 'Do thing', internal_solution_mapping: 'Pedigree Govern' }],
  };
  const norm = normalizeReport(raw);
  // client layer keeps audit content but never surfaces pedigree_fit itself
  assert.equal(norm.client.execSummary, 'Legacy summary.');
  assert.equal(norm.client.pedigree_fit_visible, undefined);
  // pedigree mapping is relocated into the internal advisor layer
  assert.equal(norm.advisor.ai_governance_signal, 'governance note');
  assert.equal(norm.advisor.legacy_pedigree_fit.fit_level, 'Light');
  assert.equal(norm.advisor.internal_solution_mapping[0].internal_note, 'Pedigree Govern');
});

test('geo audits pass through untouched', () => {
  const norm = normalizeReport({ geo_audit: true, geo: {} });
  assert.equal(norm.isGeo, true);
  assert.equal(norm.advisor, null);
});

test('null input is handled safely', () => {
  const norm = normalizeReport(null);
  assert.equal(norm.client, null);
  assert.equal(norm.isGeo, false);
});
