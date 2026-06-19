function list(items) {
  return Array.isArray(items) ? items.filter(Boolean).map((item) => `- ${item}`).join('\n') : '';
}

export function buildReadoutGuideText(guide) {
  if (!guide) return '';

  return [
    '# Readout Call Guide',
    '',
    '## Opening Script',
    guide.opening_script || '',
    '',
    '## Executive Summary Check',
    list(guide.executive_summary_check),
    '',
    '## Scorecard Discussion',
    ...(guide.scorecard_discussion || []).map((item) =>
      [
        `### ${item.domain || 'Domain'} (${item.score || 'score not shown'})`,
        item.explanation || '',
        list(item.questions),
      ].filter(Boolean).join('\n\n'),
    ),
    '',
    '## Findings Discussion',
    ...(guide.findings_discussion || []).map((item) =>
      [`### ${item.finding || 'Finding'}`, list(item.questions)].filter(Boolean).join('\n\n'),
    ),
    '',
    '## Recommendation Prioritization',
    ...(guide.recommendation_prioritization || []).map((item) =>
      [`### ${item.recommendation || 'Recommendation'}`, list(item.questions)].filter(Boolean).join('\n\n'),
    ),
    '',
    '## Offer Fit Questions',
    list(guide.offer_fit_questions),
    '',
    '## Closing Script',
    guide.closing_script || '',
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
