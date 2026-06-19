const TYPES = {
  discovery: {
    name: 'AI Discovery',
    bands: '1.0-1.9 Nascent | 2.0-2.9 Aware | 3.0-3.9 Ready | 4.0-4.6 Capable | 4.7-5.0 Advanced',
    domains: [
      'Processes & Workflows',
      'Data & Quality',
      'Tools & Technology',
      'Team & AI Maturity',
      'Leadership & Strategy',
    ],
    gov: false,
    focus:
      'where this company could start with AI - broad and exploratory, across their workflows, data, tools, team readiness, and leadership appetite',
    questionGuidance:
      'This person is AI-curious but not technical and has NO specific project in mind yet. Keep every question plain, friendly, and open-ended. The goal is to learn how they operate, surface pain points, and gently uncover where AI might help - not to pin down a build. Do not assume any prior AI use or technical knowledge.',
    reportFraming:
      'Early-stage prospect. Tie recommendations to Tier 4 service lines through internal_solution_mapping only. The client-facing report should identify a concrete low-risk first pilot, not a generic strategy engagement. If the transcript points to knowledge reuse, advisor briefing, document search, call prep, or internal enablement, recommend a 2-week pilot design sprint with a curated data set and human review. Honest, not flattering.',
  },
  solution: {
    name: 'AI Solution Scoping',
    bands: '1.0-1.9 Unscoped | 2.0-2.9 Exploratory | 3.0-3.9 Scopable | 4.0-4.6 Build-ready | 4.7-5.0 Shovel-ready',
    domains: [
      'Problem Clarity & Value',
      'Current Workflow & Process',
      'Data & Systems Involved',
      'Technical Feasibility',
      'Business Case & Sponsorship',
    ],
    gov: false,
    focus:
      "a specific problem this company wants to solve with AI and whether it's a buildable project - the workflow, the software and file types involved, the data, and the value at stake",
    questionGuidance:
      "This person has a SPECIFIC problem or build in mind. Steer the conversation to nail down: exactly what the problem is and what it costs them (time/money/errors), the current step-by-step workflow, the specific software, tools, and file types involved (e.g. a CAD package, an ERP, particular document formats), where the relevant data lives and how clean it is, what volume/frequency they're dealing with, what 'done' looks like, and who owns the budget. Aim for enough detail to scope a concrete build and a buy-vs-build-vs-orchestrate decision. Keep wording non-technical but dig into the specifics of their tools and process.",
    reportFraming:
      "Frame as a build-scoping read: how clear and valuable the problem is, how feasible a solution is, and a recommended approach - buy an existing tool, build custom, or orchestrate both (Tier 4's implementation pattern). Recommendations should move toward a concrete pilot design sprint, prototype plan, or scoped implementation engagement. Avoid generic Strategy & Roadmap language unless the transcript is too early for a specific pilot.",
  },
  governance: {
    name: 'Agent Governance',
    bands: '1.0-1.9 Ungoverned | 2.0-2.9 Reactive | 3.0-3.9 Managed | 4.0-4.6 Governed | 4.7-5.0 Optimized',
    domains: [
      'Agent & Non-Human Identity Inventory',
      'Access Visibility & Least Privilege',
      'Segregation of Duties & Control Boundaries',
      'Lifecycle, Ownership & Expiration',
      'Audit Evidence Readiness',
    ],
    gov: true,
    focus:
      'how this company governs its AI agents and automated (non-human) identities - inventory, ownership, effective access, least privilege, segregation of duties, lifecycle, expiration, decommissioning, and audit evidence',
    questionGuidance:
      'This is a security or IT leader who ALREADY has agents or automated accounts in play. Questions can be a little more pointed but stay plain-English. Surface their identity stack (Active Directory, Entra, ServiceNow, Saviynt, etc.), whether they have an inventory of agents and automated accounts and who owns them, whether they can see what those accounts can actually access, segregation-of-duties coverage for non-human accounts, what happens to accounts at offboarding, and how painful audits are. Steer toward the governance gaps that Pedigree closes.',
    reportFraming:
      'Audit-grade and precise about systems, identities, access, ownership, and control evidence. A mature human IAM program does NOT lift the agent/NHI score unless the transcript proves those controls cover AI agents and non-human identities. Lead with business risk and control maturity. Product names belong only in internal_solution_mapping, never as client-facing recommendation headlines.',
  },
};

export function getAuditType(typeKey) {
  return TYPES[typeKey] || TYPES.discovery;
}

export function researchPrompt(t) {
  return `You are a consultant at Tier 4 Intelligence (Alpharetta, GA) prepping a salesperson for an "${t.name}" discovery call. The salesperson is NOT technical. Use web search to research the company, then prepare them.

Focus the audit on ${t.focus}.

How to pitch the questions: ${t.questionGuidance}

Steps: (1) research what the company does, its industry, rough size, and anything relevant to their likely AI needs and systems; (2) write 10-15 plain-English, conversational discovery questions tailored to THIS company that a non-technical salesperson can ask to lead this specific kind of conversation. No jargon. Make at least a few questions specific to the company (reference their industry/products/situation). The questions should naturally surface what these areas need: ${t.domains.join(', ')}.

Include 3 to 5 business impact questions near the end. Their purpose is to help the advisor quantify the cost of the problem using the client's own numbers. Ask naturally about people involved, hours spent, loaded hourly cost, error or rework frequency, delays, missed opportunities, and the cost of doing nothing. Do not make the call feel like a finance interrogation, and do not ask these before a real pain point has surfaced.

Return only JSON matching the requested schema. Use ASCII characters only. Do not use Markdown headings.`;
}

export function reportPrompt(t) {
  return `You are a senior consultant at Tier 4 Intelligence (Alpharetta, GA) writing an "${t.name}" readout from a discovery call transcript. Extract evidence from the transcript yourself. Score these five dimensions 1-5: ${t.domains.join(', ')}. Rubric: 1 absent/ad hoc, 2 recognized but unaddressed, 3 workable foundations, 4 solid/resourced, 5 best-in-class. Bands: ${t.bands}. The client_report.overall score must equal the one-decimal mean of the five scorecard scores. If a dimension isn't covered, give a conservative score and say the evidence is thin rather than inventing detail.

${t.reportFraming}

You return THREE separate layers. Keep them strictly separated:

1. client_report - the honest, product-neutral audit the advisor can show or send to the client.
   - Write for a business leader. No internal product planning, no sales strategy.
   - DO NOT include Pedigree, internal product names, SKU names, or demo recommendations anywhere in client_report. If the transcript shows a possible need for AI governance, describe it generically as AI use case tracking, ownership, data access visibility, a human review process, approved tools, or a lightweight AI operating model.
   - executive_summary: tight, centered on business risk, readiness, and next best action.
   - top_findings: exactly 3 plain-English findings.
   - business_risk: one direct statement that explains the "so what."
   - scorecard: the five domains in this order: ${t.domains.join(', ')}. Each entry explains the finding, what it means, why it matters, and transcript evidence.
   - recommendations: 5-8 advisory actions sorted by impact then effort. Titles must be advisory actions such as "Establish an authoritative inventory" or "Create auditor-ready evidence packs." Never start a title with Tier 4, Pedigree, Discover, Govern, Enforce, SKU, or product language.
   - recommended_first_pilot: concrete, low-risk, human-reviewed, easy to sell. Prefer phrasing like "2-week Advisor Knowledge Pilot Design Sprint" over generic strategy language.
   - roadmap: title must match the periods used. Use "180-Day Roadmap" if any phase is "91-180 days"; otherwise "90-Day Roadmap."
   - next_step_options: 2-5 neutral next-step choices the client could pick (for example a strategy roadmap, a focused pilot, a quick-win package, or a technical scoping exercise).

2. advisor_intelligence - internal only, never shown to the client.
   - ai_governance_signal: approved use cases, owners, data access, review expectations, refresh cadence, escalation paths before AI spreads department by department.
   - next_step_signals, proposal_type_suggestion, prd_readiness, objections_to_explore.
   - internal_solution_mapping: map findings to a generic signal (prefer the signal enum). Only the internal_note field may reference Pedigree or internal SKUs, and only when genuinely relevant.

3. system_metadata - quality_flags for anything thin or risky, and economic_capture_status. Set economic_capture_status to "not_assessed" (economics are quantified in a separate step).

Output hygiene:
- Return only JSON matching the requested schema.
- Use ASCII characters only. Write concise plain text, not Markdown.
- Do not include Markdown headings, URLs, citations, footnotes, bracketed source links, smart quotes, em dashes, or corrupted characters.
- Complete every sentence. Do not leave text ending with words like "for", "and", "or", "to", "with", or with a comma or colon.`;
}

export function chunkAnalysisPrompt(t) {
  return `You are parsing one chunk of a longer "${t.name}" discovery transcript for Tier 4 Intelligence.

This is not the final report. Extract structured evidence from this chunk only. The full transcript is being processed chunk by chunk, and every chunk will be included in the final evidence set.

Focus areas: ${t.domains.join(', ')}.

Rules:
- Use only this chunk.
- Do not invent facts.
- Capture every concrete detail that could matter later: evidence, systems, workflows, pain points, objections, buying signals, recommended opportunities, and useful short quotes.
- If this chunk contains no evidence for a category, return an empty array for that category.
- Do not treat this as a summary. Treat it as an evidence extraction pass for this exact chunk.
- Use ASCII characters only.
- Return only JSON matching the requested schema.`;
}

export function evidenceMergePrompt(t) {
  return `You are merging structured evidence packets from consecutive chunks of a longer "${t.name}" discovery transcript.

This is not the final report. Preserve evidence coverage from every supplied packet while removing true duplicates only. Do not drop unique findings, systems, workflow details, objections, buying signals, risks, opportunities, or useful evidence.

Focus areas: ${t.domains.join(', ')}.

Rules:
- Use only the supplied evidence packets.
- Preserve chunk references when they are useful.
- Do not invent facts.
- Consolidate repeated evidence, but never omit unique transcript evidence.
- Use ASCII characters only.
- Return only JSON matching the requested schema.`;
}

export function reportFromEvidencePrompt(t) {
  return `${reportPrompt(t)}

The input is a complete, chunk-by-chunk evidence packet created from the full transcript. Treat it as the transcript evidence source. The transcript was not sampled for final reporting; every chunk was parsed before this final report step.

When writing evidence fields, cite the specific evidence from the packet naturally. If the packet has thin evidence for a domain, score conservatively and say the evidence is thin.`;
}

export function reportRepairPrompt(t) {
  return `Repair the provided "${t.name}" report JSON so it matches the requested schema and validation rules.

Rules:
- Do not add new substantive claims.
- Fix only JSON structure, missing required fields, corrupted characters, roadmap consistency, score math, product-language placement, and formatting.
- Complete any clipped or unfinished sentence without adding new substantive claims.
- Use ASCII characters only.
- client_report.overall must equal the one-decimal mean of the five client_report.scorecard scores.
- client_report must stay product-neutral: remove any Pedigree, internal product, SKU, or demo language from client_report and keep product references only inside advisor_intelligence.internal_solution_mapping.
- If any roadmap phase is "91-180 days", the roadmap title must be "180-Day Roadmap"; otherwise use "90-Day Roadmap".
- Return only valid JSON matching the requested schema.`;
}

export const followupPrompt =
  'You are a Tier 4 Intelligence consultant. Write a short, warm post-call follow-up email to the client: thank them, name 1-2 things you heard, and tee up the readout as the next step. Plain text only, no subject line, under 130 words.';

export const readoutGuidePrompt = `You are a Tier 4 Intelligence sales leader creating a concise second-call readout assistant for an advisor.

The advisor will use the client-facing audit report as the main agenda on a live call. Your job is to give them a short, natural conversation aid - NOT a full call script and NOT a long document.

Rules:
- Output structured JSON only. Do not write a long Markdown blob.
- Keep everything short enough to glance at on a live call.
- opening_script and closing_script: at most 75 words each, conversational and non-pushy.
- conversation_goal: one or two sentences.
- confirm_report_questions: 3 to 5 questions that check what is accurate, overstated, or missing, and which finding matters most.
- economic_validation: a short validation_script and 2 to 4 questions that pressure-test the estimated annual cost of the problem and surface missed costs (rework, delays, onboarding, client experience, missed revenue). If no cost estimate is supplied, set estimated_annual_cost to null and write questions that help quantify it.
- priority_questions: 2 to 4 questions about which recommendation is a now item and who must be involved.
- next_step_options: 2 to 5 neutral next-step choices (strategy roadmap, focused pilot, quick-win package, technical scoping).
- buying_signal_checklist: short checkbox labels the advisor can tick (agreement, correction, economics validated/revised, budget, decision maker, timeline, proposal requested, PRD requested, governance discussed, no next step yet).
- objection_questions: 2 to 4 gentle questions to surface hesitations.
- optional_deep_dive_questions: deeper probes grouped by section, used only if the advisor expands them.
- Do NOT include Pedigree fit or product pitches in the default readout. Mention AI governance only generically and only if the report supports it.
- Use only the supplied audit, transcript, research, and questions. Do not invent facts.
- Use ASCII characters only.`;

export const proposalPrompt = `You are a Tier 4 Intelligence consultant writing an editable business proposal after a discovery call and readout call.

Use both transcripts and the saved audit report. Prioritize what the client showed interest in during the readout call. Do not propose every recommendation unless the readout transcript clearly supports that. Convert the selected next step into a practical proposal the advisor can review and edit.

Rules:
- Avoid over-promising.
- Avoid technical jargon unless the client used it.
- Clearly mark open questions.
- Include scope, deliverables, timeline, success metrics, assumptions, risks, guardrails, and recommended next meeting or approval step.
- Pricing may be "custom quote required" or a simple editable range when the context supports it.
- Return only JSON matching the requested schema.
- Use ASCII characters only.`;

export const researchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['research', 'questions'],
  properties: {
    research: {
      type: 'string',
      description: 'A 3-4 sentence brief on the company and what to keep in mind on the call.',
    },
    questions: {
      type: 'array',
      minItems: 10,
      maxItems: 15,
      items: { type: 'string' },
    },
  },
};

const pilotSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'why_this_first',
    'target_users',
    'required_data_sources',
    'success_metrics',
    'risk_controls',
  ],
  properties: {
    title: { type: 'string', maxLength: 160 },
    why_this_first: { type: 'string', maxLength: 720 },
    target_users: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string', maxLength: 120 } },
    required_data_sources: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string', maxLength: 140 } },
    success_metrics: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string', maxLength: 160 } },
    risk_controls: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string', maxLength: 180 } },
  },
};

const scorecardSchema = {
  type: 'array',
  minItems: 5,
  maxItems: 5,
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'score', 'finding', 'meaning', 'why_it_matters', 'evidence'],
    properties: {
      name: { type: 'string', maxLength: 80 },
      score: { type: 'number', minimum: 1, maximum: 5 },
      finding: { type: 'string', maxLength: 620 },
      meaning: { type: 'string', maxLength: 620 },
      why_it_matters: { type: 'string', maxLength: 720 },
      evidence: { type: 'string', maxLength: 720 },
    },
  },
};

const roadmapSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'phases'],
  properties: {
    title: { type: 'string', enum: ['90-Day Roadmap', '180-Day Roadmap'] },
    phases: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['period', 'theme', 'actions'],
        properties: {
          period: {
            type: 'string',
            enum: ['0-30 days', '31-60 days', '61-90 days', '31-90 days', '91-180 days'],
          },
          theme: { type: 'string', maxLength: 120 },
          actions: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string', maxLength: 260 } },
        },
      },
    },
  },
};

// Client-facing layer: product-neutral. Never contains Pedigree, SKU, or internal mapping.
const clientReportSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'overall',
    'band',
    'executive_summary',
    'top_findings',
    'business_risk',
    'scorecard',
    'recommendations',
    'recommended_first_pilot',
    'roadmap',
    'next_step_options',
    'closing',
  ],
  properties: {
    overall: { type: 'number', minimum: 1, maximum: 5 },
    band: { type: 'string', maxLength: 48 },
    executive_summary: { type: 'string', maxLength: 1200 },
    top_findings: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string', maxLength: 320 } },
    business_risk: { type: 'string', maxLength: 720 },
    scorecard: scorecardSchema,
    recommendations: {
      type: 'array',
      minItems: 5,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'client_action', 'business_reason', 'impact', 'effort', 'owner'],
        properties: {
          title: { type: 'string', maxLength: 120 },
          client_action: { type: 'string', maxLength: 620 },
          business_reason: { type: 'string', maxLength: 520 },
          impact: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          effort: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          owner: { type: 'string', maxLength: 80 },
        },
      },
    },
    recommended_first_pilot: pilotSchema,
    roadmap: roadmapSchema,
    next_step_options: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string', maxLength: 200 } },
    closing: { type: 'string', maxLength: 420 },
  },
};

// Internal layer: never shown to the client or included in client exports.
const advisorIntelligenceSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'ai_governance_signal',
    'next_step_signals',
    'proposal_type_suggestion',
    'prd_readiness',
    'objections_to_explore',
    'internal_solution_mapping',
  ],
  properties: {
    ai_governance_signal: { type: 'string', maxLength: 800 },
    next_step_signals: { type: 'array', minItems: 0, maxItems: 8, items: { type: 'string', maxLength: 200 } },
    proposal_type_suggestion: { type: 'string', maxLength: 160 },
    prd_readiness: { type: 'string', maxLength: 300 },
    objections_to_explore: { type: 'array', minItems: 0, maxItems: 8, items: { type: 'string', maxLength: 240 } },
    internal_solution_mapping: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['recommendation', 'signal', 'internal_note'],
        properties: {
          recommendation: { type: 'string', maxLength: 160 },
          signal: {
            type: 'string',
            enum: [
              'AI governance signal',
              'AI use case tracking signal',
              'Agent ownership signal',
              'PRD readiness signal',
              'Proposal opportunity signal',
              'GEO/SEO signal',
              'Custom build signal',
              'Training signal',
              'None',
            ],
          },
          internal_note: { type: 'string', maxLength: 240 },
        },
      },
    },
  },
};

const systemMetadataSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['quality_flags', 'economic_capture_status'],
  properties: {
    quality_flags: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 160 } },
    economic_capture_status: {
      type: 'string',
      enum: ['not_assessed', 'insufficient_data', 'estimated', 'client_validated', 'client_revised', 'client_rejected'],
    },
  },
};

export const reportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['client_report', 'advisor_intelligence', 'system_metadata'],
  properties: {
    client_report: clientReportSchema,
    advisor_intelligence: advisorIntelligenceSchema,
    system_metadata: systemMetadataSchema,
  },
};

export const chunkEvidenceSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'chunk_index',
    'total_chunks',
    'chunk_summary',
    'domain_evidence',
    'pain_points',
    'workflows',
    'systems_and_data',
    'buying_signals',
    'objections_or_risks',
    'potential_recommendations',
    'direct_quotes',
  ],
  properties: {
    chunk_index: { type: 'number' },
    total_chunks: { type: 'number' },
    chunk_summary: { type: 'string', maxLength: 1100 },
    domain_evidence: {
      type: 'array',
      minItems: 0,
      maxItems: 15,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['domain', 'evidence', 'score_signal'],
        properties: {
          domain: { type: 'string', maxLength: 100 },
          evidence: { type: 'string', maxLength: 820 },
          score_signal: { type: 'string', enum: ['weak', 'mixed', 'strong', 'not_covered'] },
        },
      },
    },
    pain_points: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 320 },
    },
    workflows: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 340 },
    },
    systems_and_data: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 320 },
    },
    buying_signals: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 300 },
    },
    objections_or_risks: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 300 },
    },
    potential_recommendations: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: { type: 'string', maxLength: 340 },
    },
    direct_quotes: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', maxLength: 280 },
    },
  },
};

export const readoutGuideSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'conversation_goal',
    'opening_script',
    'confirm_report_questions',
    'economic_validation',
    'priority_questions',
    'next_step_options',
    'buying_signal_checklist',
    'objection_questions',
    'closing_script',
    'optional_deep_dive_questions',
  ],
  properties: {
    conversation_goal: { type: 'string', maxLength: 400 },
    opening_script: { type: 'string', maxLength: 700 },
    confirm_report_questions: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', maxLength: 240 },
    },
    economic_validation: {
      type: 'object',
      additionalProperties: false,
      required: ['estimated_annual_cost', 'validation_script', 'questions'],
      properties: {
        estimated_annual_cost: { type: ['number', 'null'] },
        validation_script: { type: 'string', maxLength: 500 },
        questions: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string', maxLength: 260 } },
      },
    },
    priority_questions: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: { type: 'string', maxLength: 240 },
    },
    next_step_options: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: { type: 'string', maxLength: 200 },
    },
    buying_signal_checklist: {
      type: 'array',
      minItems: 4,
      maxItems: 14,
      items: { type: 'string', maxLength: 120 },
    },
    objection_questions: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: { type: 'string', maxLength: 240 },
    },
    closing_script: { type: 'string', maxLength: 700 },
    optional_deep_dive_questions: {
      type: 'array',
      minItems: 0,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['section', 'questions'],
        properties: {
          section: { type: 'string', maxLength: 120 },
          questions: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', maxLength: 260 } },
        },
      },
    },
  },
};

export const proposalSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'proposal_title',
    'proposal_type',
    'client_context',
    'what_we_heard',
    'confirmed_priorities',
    'recommended_next_step',
    'scope_of_work',
    'deliverables',
    'timeline',
    'client_responsibilities',
    'tier4_responsibilities',
    'success_metrics',
    'assumptions',
    'risks_and_guardrails',
    'optional_add_ons',
    'open_questions',
    'recommended_next_meeting',
    'pricing_notes',
  ],
  properties: {
    proposal_title: { type: 'string', maxLength: 180 },
    proposal_type: {
      type: 'string',
      enum: [
        'Strategy & Roadmap Proposal',
        'Focused AI Pilot Proposal',
        'GEO/SEO Optimization Package Proposal',
        'Pedigree Demo / Agent Governance Proposal',
        'Custom Build Proposal',
        'Training & Enablement Proposal',
        'PRD / Technical Scoping Proposal',
      ],
    },
    client_context: { type: 'string', maxLength: 1200 },
    what_we_heard: {
      type: 'array',
      minItems: 3,
      maxItems: 8,
      items: { type: 'string', maxLength: 320 },
    },
    confirmed_priorities: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 320 },
    },
    recommended_next_step: { type: 'string', maxLength: 900 },
    scope_of_work: {
      type: 'array',
      minItems: 3,
      maxItems: 10,
      items: { type: 'string', maxLength: 360 },
    },
    deliverables: {
      type: 'array',
      minItems: 3,
      maxItems: 10,
      items: { type: 'string', maxLength: 300 },
    },
    timeline: { type: 'string', maxLength: 700 },
    client_responsibilities: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    tier4_responsibilities: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    success_metrics: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    assumptions: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    risks_and_guardrails: {
      type: 'array',
      minItems: 2,
      maxItems: 8,
      items: { type: 'string', maxLength: 300 },
    },
    optional_add_ons: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    open_questions: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', maxLength: 260 },
    },
    recommended_next_meeting: { type: 'string', maxLength: 500 },
    pricing_notes: { type: 'string', maxLength: 700 },
  },
};

export const economicExtractPrompt = `You are a Tier 4 Intelligence consultant quantifying the economic cost of a client's problem from a discovery call. The goal is to turn the pain into a defensible number the advisor can pressure-test on the next call.

Hard rules:
- NEVER invent numbers. Use only client-stated values, advisor-calculated values derived from client-stated values, or clearly labeled assumptions.
- Always show the formula in plain words and as a simple calculation.
- For every input, mark its source: client_stated, advisor_calculated, ai_inferred, or missing.
- If the transcript does not contain enough data, set status to "insufficient_data", leave numeric estimates null, and provide suggested_follow_up_questions to ask next time.
- Use conservative ranges for savings. Do not present low-confidence numbers as guarantees or ROI.
- confidence is Low/Medium/High based on how grounded the inputs are.

Calculation guidance: a common pattern is people_affected x hours_per_person_per_week x hourly_cost x weeks_per_year = annual_cost_estimate. Capture whatever the transcript supports (error frequency, cost per error, delay cost, missed revenue) and explain the basis.

Return only JSON matching the requested schema. Use ASCII characters only. No Markdown.`;

export const economicSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status',
    'currency',
    'confidence',
    'annual_cost_estimate',
    'annual_savings_low',
    'annual_savings_high',
    'calculation_basis',
    'formula',
    'improvement_target',
    'cost_drivers',
    'inputs',
    'assumptions',
    'missing_inputs',
    'evidence_quotes',
    'validation_question',
    'suggested_follow_up_questions',
  ],
  properties: {
    status: { type: 'string', enum: ['estimated', 'insufficient_data'] },
    currency: { type: 'string', maxLength: 8 },
    confidence: { type: 'string', enum: ['Low', 'Medium', 'High'] },
    annual_cost_estimate: { type: ['number', 'null'] },
    annual_savings_low: { type: ['number', 'null'] },
    annual_savings_high: { type: ['number', 'null'] },
    calculation_basis: { type: 'string', maxLength: 700 },
    formula: { type: 'string', maxLength: 400 },
    improvement_target: { type: 'string', maxLength: 240 },
    cost_drivers: { type: 'array', minItems: 0, maxItems: 8, items: { type: 'string', maxLength: 200 } },
    inputs: {
      type: 'array',
      minItems: 0,
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'value', 'source'],
        properties: {
          label: { type: 'string', maxLength: 120 },
          value: { type: 'string', maxLength: 120 },
          source: {
            type: 'string',
            enum: ['client_stated', 'advisor_calculated', 'ai_inferred', 'missing'],
          },
        },
      },
    },
    assumptions: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
    missing_inputs: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 200 } },
    evidence_quotes: { type: 'array', minItems: 0, maxItems: 8, items: { type: 'string', maxLength: 280 } },
    validation_question: { type: 'string', maxLength: 320 },
    suggested_follow_up_questions: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', maxLength: 240 },
    },
  },
};
