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

export const readoutGuidePrompt = `You are a Tier 4 Intelligence sales leader prepping an advisor for a second call with a prospect.

On this call the advisor will share the audit report on screen and simply talk through it with the client. They are NOT reading a script. They are having a friendly, conversational meeting. Your only job is to hand them a few high-leverage things worth asking - the gaps the first call did not fully answer - so the conversation fills in what we are missing and gets us to a confident next step.

Think like this: read the discovery transcript and the report, then ask "what do we still NOT know that would most change the recommendation, the scope, or the decision?" Those are the gaps.

Rules:
- Output structured JSON only. No scripts, no "say this then say that", no opening or closing lines.
- call_focus: one warm, plain-English sentence describing what this second call is for (review the findings together and agree on the best next step).
- gaps: 3 to 5 items. Each gap is something genuinely unresolved or thin from the first call that matters. For each:
  - topic: a short label for the area (e.g. "Who owns the data", "Current tool spend", "Decision timeline").
  - why_it_matters: one sentence on why getting this answer is high-leverage for the recommendation or the deal.
  - suggested_question: ONE natural, conversational question the advisor could ask. Friendly and open, not an interrogation. No jargon the client did not use.
- Pick gaps that are specific to THIS company and transcript. Do not produce generic discovery questions that were already answered on the first call.
- Do not invent facts. Use only the supplied audit, transcript, research, and questions.
- Use ASCII characters only.`;

export const proposalDraftPrompt = `You are a Tier 4 Intelligence consultant writing a DRAFT proposal after the first discovery call.

This draft is the centerpiece of the second call: the advisor will put it on screen and talk through it with the client, section by section, in a natural conversation. The client will react - correcting numbers, narrowing scope, confirming priorities - and those reactions get captured in the second call's transcript. So the draft must be concrete enough to react to, and honest about what is still an assumption.

Use the company research, the discovery questions, the discovery transcript, and the audit report. Propose the single most sensible engagement given what was heard - do not hedge across every possible service.

Rules:
- Avoid over-promising.
- Avoid technical jargon unless the client used it.
- Be specific and concrete: real numbers, real scope items, real timelines. A slightly-wrong specific draft invites correction; a vague draft invites silence.
- assumptions: state every meaningful assumption plainly - these are the things the advisor will confirm on the call.
- open_questions: the 3-6 things the client's reaction on the call should settle (scope, budget range, timeline, owner, data access).
- what_changed_on_the_call: ALWAYS an empty array in the draft - nothing has been discussed yet.
- Include scope, deliverables, timeline, success metrics, assumptions, risks, guardrails, and recommended next meeting or approval step.
- Pricing may be "custom quote required" or a simple editable range when the context supports it.

Value-case rules (fill the value_case block):
- Only discovery-stage estimates exist at this point. Label them clearly as directional estimates (not validated). Use the directional_note field to say so in plain language.
- Never use ROI percentage language when confidence is Low. For Low confidence, present ranges and the underlying math, not a single payback figure.
- Show simple math in the basis field: how the annual cost, savings range, and payback range were derived (e.g. "120 hrs/wk x $85/hr x 48 wks = $489,600/yr").
- If there is insufficient economic data, set annual_cost_estimate and savings fields to null, confidence to "Low", and explain what is missing in the basis field.
- Headline is one sentence the advisor can reuse in a follow-up email.

Return only JSON matching the requested schema. Use ASCII characters only.`;

export const proposalPrompt = `You are a Tier 4 Intelligence consultant writing the FINAL editable business proposal after a discovery call and a second (review) call.

Use both transcripts, the saved audit report, and the proposal draft that was reviewed on the second call. Prioritize what the client showed interest in during the second call. Do not propose every recommendation unless the second-call transcript clearly supports that. Convert the agreed next step into a practical proposal the advisor can review and send.

what_changed_on_the_call rules (this section is important):
- List 3-7 concrete differences between the draft that was reviewed and this final proposal, based on the second-call transcript: numbers the client corrected or validated, scope the client added or removed, priorities that shifted, budget or timeline reactions, and decisions made.
- Each item is one plain sentence, e.g. "Client confirmed the $80k annual cost estimate" or "Dropped the inventory module - client wants sales follow-up only for phase 1".
- If the transcript genuinely shows no changes, include one item saying the client confirmed the draft as presented.

Rules:
- Avoid over-promising.
- Avoid technical jargon unless the client used it.
- Clearly mark open questions.
- Include scope, deliverables, timeline, success metrics, assumptions, risks, guardrails, and recommended next meeting or approval step.
- Pricing may be "custom quote required" or a simple editable range when the context supports it.

Value-case rules (fill the value_case block):
- If validated economic impact numbers are provided in the input, prefer them and mark confidence accordingly.
- If only discovery-stage estimates exist, label them clearly as directional estimates (not validated). Use the directional_note field to say so in plain language.
- Never use ROI percentage language when confidence is Low. For Low confidence, present ranges and the underlying math, not a single payback figure.
- Show simple math in the basis field: how the annual cost, savings range, and payback range were derived (e.g. "120 hrs/wk x $85/hr x 48 wks = $489,600/yr").
- Investment range should be the engagement price range (editable). Payback range = investment / annual savings, shown only when confidence is Medium or High.
- If there is insufficient economic data, set annual_cost_estimate and savings fields to null, confidence to "Low", and explain what is missing in the basis field.
- Headline is one sentence the advisor can reuse in a follow-up email.

Return only JSON matching the requested schema. Use ASCII characters only.`;

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
  required: ['call_focus', 'gaps'],
  properties: {
    call_focus: { type: 'string', maxLength: 320 },
    gaps: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['topic', 'why_it_matters', 'suggested_question'],
        properties: {
          topic: { type: 'string', maxLength: 80 },
          why_it_matters: { type: 'string', maxLength: 240 },
          suggested_question: { type: 'string', maxLength: 240 },
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
    'what_changed_on_the_call',
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
    'value_case',
  ],
  properties: {
    proposal_title: { type: 'string', maxLength: 180 },
    proposal_type: {
      type: 'string',
      enum: [
        'Strategy & Roadmap Proposal',
        'Focused AI Pilot Proposal',
        'GEO/SEO Optimization Package Proposal',
        'Agent Governance Demo Proposal',
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
    what_changed_on_the_call: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', maxLength: 320 },
      description: 'Empty in the draft. In the final proposal: what the second call changed vs the reviewed draft.',
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
    value_case: {
      type: 'object',
      additionalProperties: false,
      required: [
        'headline',
        'confidence',
        'annual_cost_estimate',
        'annual_savings_low',
        'annual_savings_high',
        'investment_low',
        'investment_high',
        'payback_months_low',
        'payback_months_high',
        'basis',
        'directional_note',
      ],
      properties: {
        headline: { type: 'string', maxLength: 280 },
        confidence: { type: 'string', enum: ['Low', 'Medium', 'High'] },
        annual_cost_estimate: { type: ['number', 'null'] },
        annual_savings_low: { type: ['number', 'null'] },
        annual_savings_high: { type: ['number', 'null'] },
        investment_low: { type: ['number', 'null'] },
        investment_high: { type: ['number', 'null'] },
        payback_months_low: { type: ['number', 'null'] },
        payback_months_high: { type: ['number', 'null'] },
        basis: { type: 'string', maxLength: 800 },
        directional_note: { type: 'string', maxLength: 400 },
      },
    },
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

export const buildPackagePrompt = `You are a Tier 4 Intelligence solutions architect preparing a developer handoff package. A third-party development shop will read this to understand what we want built and to return a scope and a quote.

You have the discovery call, the second (readout) call, the audit report, and the client proposal. Translate all of that into three clear documents: a product spec, a technical spec, and a build plan. Write so a competent engineering team that has never spoken to the client can understand the work and price it.

Rules:
- Be concrete and specific to THIS client and what they actually need. Do not pad with generic boilerplate.
- Write in plain, professional language. Define the few technical terms you must use.
- Never invent details the client did not imply. When something important is unknown, put it in open_questions instead of guessing.
- Estimates (phases, durations, effort) are PRELIMINARY planning ranges only. Always frame them as subject to the development shop's own estimate. Never present an estimate as a fixed price or commitment.
- overview: 2 to 4 sentences a dev shop reads first - what is being built and why it matters to the client.
- product_spec: the problem, goals, who uses it, the core features (each with a priority of MVP, Phase 2, or Nice-to-have), the main user flows, what is explicitly out of scope, and how success is measured.
- tech_spec: a recommended high-level architecture, the main components and what each does, external systems/APIs to integrate, the key data entities, any AI/ML components (models, prompts, agents), and security/compliance and infrastructure considerations.
- build_plan: phases (each with a rough duration range and its deliverables), key milestones, a rough overall effort range, the team roles likely needed, planning assumptions, and risks.
- open_questions: everything the dev shop would need answered before they can give a firm quote.
- Return only JSON matching the requested schema. Use ASCII characters only.`;

const featurePrioritySchema = {
  type: 'string',
  enum: ['MVP', 'Phase 2', 'Nice-to-have'],
};

export const buildPackageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['overview', 'product_spec', 'tech_spec', 'build_plan', 'open_questions'],
  properties: {
    overview: { type: 'string', maxLength: 900 },
    product_spec: {
      type: 'object',
      additionalProperties: false,
      required: [
        'problem',
        'goals',
        'target_users',
        'core_features',
        'user_flows',
        'out_of_scope',
        'success_metrics',
      ],
      properties: {
        problem: { type: 'string', maxLength: 900 },
        goals: { type: 'array', minItems: 2, maxItems: 8, items: { type: 'string', maxLength: 240 } },
        target_users: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'string', maxLength: 160 } },
        core_features: {
          type: 'array',
          minItems: 3,
          maxItems: 14,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'description', 'priority'],
            properties: {
              name: { type: 'string', maxLength: 120 },
              description: { type: 'string', maxLength: 400 },
              priority: featurePrioritySchema,
            },
          },
        },
        user_flows: { type: 'array', minItems: 1, maxItems: 10, items: { type: 'string', maxLength: 360 } },
        out_of_scope: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
        success_metrics: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'string', maxLength: 240 } },
      },
    },
    tech_spec: {
      type: 'object',
      additionalProperties: false,
      required: [
        'recommended_architecture',
        'components',
        'integrations',
        'data_model',
        'ai_components',
        'security_and_compliance',
        'infrastructure',
      ],
      properties: {
        recommended_architecture: { type: 'string', maxLength: 900 },
        components: {
          type: 'array',
          minItems: 2,
          maxItems: 12,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'responsibility'],
            properties: {
              name: { type: 'string', maxLength: 120 },
              responsibility: { type: 'string', maxLength: 320 },
            },
          },
        },
        integrations: { type: 'array', minItems: 0, maxItems: 12, items: { type: 'string', maxLength: 200 } },
        data_model: { type: 'array', minItems: 0, maxItems: 14, items: { type: 'string', maxLength: 240 } },
        ai_components: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 280 } },
        security_and_compliance: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
        infrastructure: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
      },
    },
    build_plan: {
      type: 'object',
      additionalProperties: false,
      required: ['phases', 'milestones', 'effort_estimate', 'team_roles', 'assumptions', 'risks'],
      properties: {
        phases: {
          type: 'array',
          minItems: 2,
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'duration_estimate', 'deliverables'],
            properties: {
              name: { type: 'string', maxLength: 120 },
              duration_estimate: { type: 'string', maxLength: 120 },
              deliverables: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'string', maxLength: 240 } },
            },
          },
        },
        milestones: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
        effort_estimate: { type: 'string', maxLength: 400 },
        team_roles: { type: 'array', minItems: 1, maxItems: 10, items: { type: 'string', maxLength: 160 } },
        assumptions: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
        risks: { type: 'array', minItems: 0, maxItems: 10, items: { type: 'string', maxLength: 240 } },
      },
    },
    open_questions: { type: 'array', minItems: 0, maxItems: 12, items: { type: 'string', maxLength: 240 } },
  },
};
