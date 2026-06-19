function list(items) {
  return Array.isArray(items) ? items.filter(Boolean).map((item) => `- ${item}`).join('\n') : '';
}

function money(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return `$${number.toLocaleString('en-US')}`;
}

export function buildReadoutGuideText(guide) {
  if (!guide) return '';

  const economic = guide.economic_validation || {};
  const estimate = money(economic.estimated_annual_cost);

  return [
    '# Readout Call Assistant',
    '',
    guide.conversation_goal ? `Goal: ${guide.conversation_goal}` : '',
    '',
    '## Open the Call',
    guide.opening_script || '',
    '',
    '## Confirm the Report',
    list(guide.confirm_report_questions),
    '',
    '## Validate the Economics',
    estimate ? `Estimated annual cost: ${estimate}` : 'Estimated annual cost: not yet quantified',
    economic.validation_script || '',
    list(economic.questions),
    '',
    '## Prioritize the Next Step',
    list(guide.priority_questions),
    guide.next_step_options && guide.next_step_options.length ? 'Next step options:' : '',
    list(guide.next_step_options),
    '',
    '## Capture Buying Signals',
    list(guide.buying_signal_checklist),
    '',
    '## Objections',
    list(guide.objection_questions),
    '',
    '## Close',
    guide.closing_script || '',
    '',
    ...(guide.optional_deep_dive_questions && guide.optional_deep_dive_questions.length
      ? [
          '## Optional Deep Dive',
          ...guide.optional_deep_dive_questions.map((item) =>
            [`### ${item.section || 'Section'}`, list(item.questions)].filter(Boolean).join('\n\n'),
          ),
        ]
      : []),
  ].filter((part) => part !== '').join('\n').trim();
}

export function buildProposalText(proposal) {
  if (!proposal) return '';

  return [
    `# ${proposal.proposal_title || 'Tier 4 Intelligence Proposal'}`,
    '',
    `Proposal type: ${proposal.proposal_type || 'AI Recommended'}`,
    '',
    '## Client Context',
    proposal.client_context || '',
    '',
    '## What We Heard',
    list(proposal.what_we_heard),
    '',
    '## Confirmed Priorities',
    list(proposal.confirmed_priorities),
    '',
    '## Recommended Next Step',
    proposal.recommended_next_step || '',
    '',
    '## Scope of Work',
    list(proposal.scope_of_work),
    '',
    '## Deliverables',
    list(proposal.deliverables),
    '',
    '## Timeline',
    proposal.timeline || '',
    '',
    '## Client Responsibilities',
    list(proposal.client_responsibilities),
    '',
    '## Tier 4 Responsibilities',
    list(proposal.tier4_responsibilities),
    '',
    '## Success Metrics',
    list(proposal.success_metrics),
    '',
    '## Assumptions',
    list(proposal.assumptions),
    '',
    '## Risks and Guardrails',
    list(proposal.risks_and_guardrails),
    '',
    '## Optional Add-ons',
    list(proposal.optional_add_ons),
    '',
    '## Open Questions',
    list(proposal.open_questions),
    '',
    '## Pricing Notes',
    proposal.pricing_notes || 'Pricing to be confirmed after scope review.',
    '',
    '## Recommended Next Meeting or Approval Step',
    proposal.recommended_next_meeting || '',
  ].filter((part) => part !== '').join('\n').trim();
}
