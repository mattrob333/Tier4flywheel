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

  const gaps = Array.isArray(guide.gaps) ? guide.gaps.filter(Boolean) : [];

  return [
    '# Second Call - Things Worth Asking',
    '',
    guide.call_focus ? guide.call_focus : '',
    '',
    'Share the report on screen and talk through it together. These are the few gaps the first',
    'call left open - work them into the conversation where they fit naturally.',
    '',
    ...gaps.map((gap, index) =>
      [
        `## ${index + 1}. ${gap.topic || 'Gap to explore'}`,
        gap.why_it_matters ? `Why it matters: ${gap.why_it_matters}` : '',
        gap.suggested_question ? `Ask: ${gap.suggested_question}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ]
    .filter((part) => part !== '')
    .join('\n')
    .trim();
}

function buildValueCaseText(vc) {
  if (!vc) return '';
  const cost = money(vc.annual_cost_estimate);
  const savingsLow = money(vc.annual_savings_low);
  const savingsHigh = money(vc.annual_savings_high);
  const invLow = money(vc.investment_low);
  const invHigh = money(vc.investment_high);
  const paybackLow = vc.payback_months_low != null ? `${vc.payback_months_low} mo` : '';
  const paybackHigh = vc.payback_months_high != null ? `${vc.payback_months_high} mo` : '';

  return [
    '## Value Case',
    vc.headline || '',
    '',
    cost ? `Estimated annual problem cost: ${cost}` : '',
    (savingsLow || savingsHigh) ? `Estimated annual savings range: ${savingsLow || '—'} – ${savingsHigh || '—'}` : '',
    (invLow || invHigh) ? `Investment range: ${invLow || '—'} – ${invHigh || '—'}` : '',
    (paybackLow || paybackHigh) ? `Estimated payback: ${paybackLow || '—'} – ${paybackHigh || '—'}` : '',
    vc.confidence ? `Confidence: ${vc.confidence}` : '',
    vc.directional_note ? `Note: ${vc.directional_note}` : '',
    vc.basis ? `Basis: ${vc.basis}` : '',
  ].filter((part) => part !== '').join('\n');
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
    buildValueCaseText(proposal.value_case),
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

export function buildBuildPackageText(pkg, clientName = '') {
  if (!pkg) return '';

  const product = pkg.product_spec || {};
  const tech = pkg.tech_spec || {};
  const plan = pkg.build_plan || {};
  const title = clientName ? `${clientName} - Developer Build Package` : 'Developer Build Package';

  const features = Array.isArray(product.core_features)
    ? product.core_features
        .filter(Boolean)
        .map((f) => `- [${f.priority || 'MVP'}] ${f.name}: ${f.description}`)
        .join('\n')
    : '';

  const components = Array.isArray(tech.components)
    ? tech.components
        .filter(Boolean)
        .map((c) => `- ${c.name}: ${c.responsibility}`)
        .join('\n')
    : '';

  const phases = Array.isArray(plan.phases)
    ? plan.phases
        .filter(Boolean)
        .map((p) =>
          [
            `### ${p.name}${p.duration_estimate ? ` (${p.duration_estimate})` : ''}`,
            list(p.deliverables),
          ]
            .filter(Boolean)
            .join('\n'),
        )
        .join('\n\n')
    : '';

  return [
    `# ${title}`,
    '',
    'Prepared by Tier 4 Intelligence for a third-party development scope and quote.',
    'Estimates below are preliminary planning ranges and are subject to the development team\'s own estimate.',
    '',
    '## Overview',
    pkg.overview || '',
    '',
    '# 1. Product Spec',
    '',
    '## Problem',
    product.problem || '',
    '',
    '## Goals',
    list(product.goals),
    '',
    '## Target Users',
    list(product.target_users),
    '',
    '## Core Features',
    features,
    '',
    '## User Flows',
    list(product.user_flows),
    '',
    '## Out of Scope',
    list(product.out_of_scope),
    '',
    '## Success Metrics',
    list(product.success_metrics),
    '',
    '# 2. Technical Spec',
    '',
    '## Recommended Architecture',
    tech.recommended_architecture || '',
    '',
    '## Components',
    components,
    '',
    '## Integrations',
    list(tech.integrations),
    '',
    '## Data Model',
    list(tech.data_model),
    '',
    '## AI Components',
    list(tech.ai_components),
    '',
    '## Security and Compliance',
    list(tech.security_and_compliance),
    '',
    '## Infrastructure',
    list(tech.infrastructure),
    '',
    '# 3. Build Plan',
    '',
    '## Phases',
    phases,
    '',
    '## Milestones',
    list(plan.milestones),
    '',
    '## Effort Estimate',
    plan.effort_estimate || '',
    '',
    '## Team Roles',
    list(plan.team_roles),
    '',
    '## Assumptions',
    list(plan.assumptions),
    '',
    '## Risks',
    list(plan.risks),
    '',
    '# Open Questions',
    list(pkg.open_questions),
  ]
    .filter((part) => part !== '')
    .join('\n')
    .trim();
}
