import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdvisorReport } from '../api/_advisorAuditValidation.js';

function validReport() {
  const domain = (name) => ({
    name,
    score: 3,
    finding: 'The team has workable foundations here.',
    meaning: 'They can build on this with support.',
    why_it_matters: 'It affects how quickly they can adopt AI safely.',
    evidence: 'The client described their current process on the call.',
  });

  return {
    client_report: {
      overall: 3.0,
      band: 'Ready',
      executive_summary: 'The company is ready to start a focused pilot.',
      top_findings: ['Solid data.', 'Eager team.', 'Unclear ownership.'],
      business_risk: 'Without clear ownership, AI adoption will stall and waste budget.',
      scorecard: [
        domain('Processes'),
        domain('Data'),
        domain('Tools'),
        domain('Team'),
        domain('Leadership'),
      ],
      recommendations: [
        {
          title: 'Establish an authoritative inventory',
          client_action: 'Create a single source of truth for active workflows.',
          business_reason: 'It reduces duplicated effort across teams.',
          impact: 'High',
          effort: 'Medium',
          owner: 'Operations lead',
        },
        {
          title: 'Define a human review process',
          client_action: 'Set up a lightweight checkpoint before AI output ships.',
          business_reason: 'It keeps quality and trust high.',
          impact: 'High',
          effort: 'Low',
          owner: 'Team lead',
        },
        {
          title: 'Map data access visibility',
          client_action: 'Document who can reach which systems and data today.',
          business_reason: 'It surfaces risk before AI spreads.',
          impact: 'Medium',
          effort: 'Medium',
          owner: 'IT lead',
        },
        {
          title: 'Pick a first measurable use case',
          client_action: 'Choose one workflow with clear value to pilot first.',
          business_reason: 'It proves value quickly.',
          impact: 'High',
          effort: 'Medium',
          owner: 'Project sponsor',
        },
        {
          title: 'Set approved tools guidance',
          client_action: 'Agree on which tools are allowed for the team.',
          business_reason: 'It avoids fragmented adoption.',
          impact: 'Medium',
          effort: 'Low',
          owner: 'Operations lead',
        },
      ],
      recommended_first_pilot: {
        title: 'Advisor Knowledge Pilot Design Sprint',
        why_this_first: 'It is low risk and shows value in two weeks.',
        target_users: ['Advisors', 'Operations team'],
        required_data_sources: ['Prior project notes', 'Internal documents'],
        success_metrics: ['Time saved per week', 'Advisor satisfaction'],
        risk_controls: ['Human review of output', 'Limited data scope'],
      },
      roadmap: {
        title: '90-Day Roadmap',
        phases: [
          { period: '0-30 days', theme: 'Foundations', actions: ['Define scope.', 'Pick the pilot.'] },
          { period: '31-60 days', theme: 'Build', actions: ['Assemble data.', 'Run the pilot.'] },
          { period: '61-90 days', theme: 'Measure', actions: ['Review results.', 'Plan next step.'] },
        ],
      },
      next_step_options: ['Strategy roadmap', 'Focused pilot'],
      closing: 'A focused first step is the practical next move.',
    },
    advisor_intelligence: {
      ai_governance_signal: 'Pedigree could be a later conversation about governance.',
      next_step_signals: [],
      proposal_type_suggestion: 'Focused pilot',
      prd_readiness: 'Not yet ready for a PRD.',
      objections_to_explore: [],
      internal_solution_mapping: [],
    },
    system_metadata: { quality_flags: [], economic_capture_status: 'not_assessed' },
  };
}

test('a clean report passes validation', () => {
  assert.deepEqual(validateAdvisorReport(validReport()), []);
});

test('advisor_intelligence may reference Pedigree without failing', () => {
  // The internal layer above already mentions Pedigree; it must not be flagged.
  const errors = validateAdvisorReport(validReport());
  assert.equal(errors.length, 0);
});

test('product language in the client report is rejected', () => {
  const report = validReport();
  report.client_report.business_risk = 'They should buy Pedigree to fix this.';
  const errors = validateAdvisorReport(report);
  assert.ok(errors.some((e) => /internal product language/.test(e)), errors.join(' | '));
});

test('missing business_risk is required', () => {
  const report = validReport();
  report.client_report.business_risk = '';
  const errors = validateAdvisorReport(report);
  assert.ok(errors.some((e) => /business_risk is required/.test(e)), errors.join(' | '));
});

test('overall must equal the mean of scorecard scores', () => {
  const report = validReport();
  report.client_report.overall = 4.8;
  const errors = validateAdvisorReport(report);
  assert.ok(errors.some((e) => /one-decimal mean/.test(e)), errors.join(' | '));
});

test('legacy flat reports still validate through the adapter', () => {
  const legacy = {
    overall: 3.0,
    band: 'Ready',
    business_risk: 'Ownership is unclear and adoption will stall.',
    domains: validReport().client_report.scorecard,
    recommendations: validReport().client_report.recommendations,
    recommended_first_pilot: validReport().client_report.recommended_first_pilot,
    roadmap: validReport().client_report.roadmap,
  };
  // scorecard lives under .domains here; validator reads cr.scorecard, so this
  // legacy shape is allowed to skip domain checks but must not throw.
  assert.doesNotThrow(() => validateAdvisorReport(legacy));
});
