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

Return only JSON matching the requested schema. Use ASCII characters only. Do not use Markdown headings.`;
}

export function reportPrompt(t) {
  return `You are a senior consultant at Tier 4 Intelligence (Alpharetta, GA) writing an "${t.name}" readout from a discovery call transcript. Extract evidence from the transcript yourself. Score these five dimensions 1-5: ${t.domains.join(', ')}. Rubric: 1 absent/ad hoc, 2 recognized but unaddressed, 3 workable foundations, 4 solid/resourced, 5 best-in-class. Bands: ${t.bands}. Overall must equal the one-decimal mean of the five domain scores. If a dimension isn't covered, give a conservative score and say the evidence is thin rather than inventing detail.

${t.reportFraming}

Client-readiness rules:
- Write for a business leader, not for internal product planning.
- Include one direct business_risk statement that explains the "so what."
- Include primary_opportunity as the core commercial insight in one or two crisp sentences.
- Include recommended_first_pilot when the transcript supports one. Make it concrete, low-risk, human-reviewed, and easy to sell as a next step. Prefer phrasing like "2-week Advisor Knowledge Pilot Design Sprint" over generic strategy language when appropriate.
- Include ai_use_case_governance_signal as a subtle governance bridge: approved use cases, owners, data access, review expectations, refresh cadence, and escalation paths before AI spreads department by department.
- Include pedigree_fit for the salesperson. Do not say "buy Pedigree"; explain whether a lightweight registry, governance workflow, or evidence layer is a natural next conversation.
- Recommendation titles must be advisory actions such as "Establish an authoritative inventory" or "Create auditor-ready evidence packs." Do not start titles with Tier 4, Pedigree, Discover, Govern, Enforce, SKU, or product language.
- Put Tier 4/Pedigree service fit only in internal_solution_mapping.
- Every domain finding must explain the finding, what it means, why it matters, and transcript evidence.
- Roadmap title must match the periods used. Use "180-Day Roadmap" if any phase is "91-180 days"; otherwise use "90-Day Roadmap."
- Keep the executive summary tight and centered on business risk, readiness, and next best action.
- Complete every sentence. Do not leave text ending with words like "for", "and", "or", "to", "with", or with a comma or colon.

Output hygiene:
- Return only JSON matching the requested schema.
- Use ASCII characters only.
- Write concise plain text, not Markdown.
- Do not include Markdown headings, URLs, citations, footnotes, bracketed source links, smart quotes, em dashes, or corrupted characters.
- Include 5-8 recommendations sorted by impact then effort.
- Domains must stay in this order: ${t.domains.join(', ')}.`;
}

export function reportRepairPrompt(t) {
  return `Repair the provided "${t.name}" report JSON so it matches the requested schema and validation rules.

Rules:
- Do not add new substantive claims.
- Fix only JSON structure, missing required fields, corrupted characters, roadmap consistency, score math, product-language placement, and formatting.
- Complete any clipped or unfinished sentence without adding new substantive claims.
- Use ASCII characters only.
- Overall must equal the one-decimal mean of the five domain scores.
- Product names belong only in internal_solution_mapping, not recommendation titles.
- If any roadmap phase is "91-180 days", the roadmap title must be "180-Day Roadmap"; otherwise use "90-Day Roadmap".
- Return only valid JSON matching the requested schema.`;
}

export const followupPrompt =
  'You are a Tier 4 Intelligence consultant. Write a short, warm post-call follow-up email to the client: thank them, name 1-2 things you heard, and tee up the readout as the next step. Plain text only, no subject line, under 130 words.';

export const readoutGuidePrompt = `You are a Tier 4 Intelligence sales leader preparing an advisor for a second client readout call.

Write for the advisor, not the client. Use the audit report as the agenda. The goal is to pressure-test the report, learn which findings the client agrees with, uncover priority, urgency, budget, ownership, objections, and identify the best next step.

Rules:
- Use only the supplied audit, transcript, research, and questions.
- Do not invent facts.
- Keep the tone consultative, plain-English, and non-pushy.
- Include fit questions for AI Strategy & Roadmap, focused AI pilot, GEO/SEO package, Pedigree demo, custom build PRD, automation/workflow implementation, and training/enablement.
- Return only JSON matching the requested schema.
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

export const reportSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'overall',
    'band',
    'execSummary',
    'business_risk',
    'primary_opportunity',
    'recommended_first_pilot',
    'ai_use_case_governance_signal',
    'pedigree_fit',
    'topFindings',
    'domains',
    'recommendations',
    'roadmap',
    'closing',
  ],
  properties: {
    overall: { type: 'number', minimum: 1, maximum: 5 },
    band: { type: 'string', maxLength: 48 },
    execSummary: { type: 'string', maxLength: 1200 },
    business_risk: { type: 'string', maxLength: 720 },
    primary_opportunity: { type: 'string', maxLength: 720 },
    recommended_first_pilot: {
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
        target_users: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
          items: { type: 'string', maxLength: 120 },
        },
        required_data_sources: {
          type: 'array',
          minItems: 2,
          maxItems: 6,
          items: { type: 'string', maxLength: 140 },
        },
        success_metrics: {
          type: 'array',
          minItems: 2,
          maxItems: 6,
          items: { type: 'string', maxLength: 160 },
        },
        risk_controls: {
          type: 'array',
          minItems: 2,
          maxItems: 6,
          items: { type: 'string', maxLength: 180 },
        },
      },
    },
    ai_use_case_governance_signal: { type: 'string', maxLength: 800 },
    pedigree_fit: {
      type: 'object',
      additionalProperties: false,
      required: ['fit_level', 'reason', 'suggested_next_step'],
      properties: {
        fit_level: { type: 'string', enum: ['None', 'Light', 'Moderate', 'Strong'] },
        reason: { type: 'string', maxLength: 620 },
        suggested_next_step: { type: 'string', maxLength: 320 },
      },
    },
    topFindings: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string', maxLength: 320 },
    },
    domains: {
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
    },
    recommendations: {
      type: 'array',
      minItems: 5,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'client_action',
          'business_reason',
          'internal_solution_mapping',
          'impact',
          'effort',
          'owner',
        ],
        properties: {
          title: { type: 'string', maxLength: 120 },
          client_action: { type: 'string', maxLength: 620 },
          business_reason: { type: 'string', maxLength: 520 },
          internal_solution_mapping: {
            type: 'string',
            enum: [
              'Pedigree Discover',
              'Pedigree Govern',
              'Pedigree Enforce',
              'Strategy & Roadmap',
              'Focused Pilot',
              'None',
            ],
          },
          effort: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          impact: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          owner: { type: 'string', maxLength: 80 },
        },
      },
    },
    roadmap: {
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
              actions: {
                type: 'array',
                minItems: 2,
                maxItems: 4,
                items: { type: 'string', maxLength: 260 },
              },
            },
          },
        },
      },
    },
    closing: { type: 'string', maxLength: 420 },
  },
};

export const readoutGuideSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'opening_script',
    'executive_summary_check',
    'scorecard_discussion',
    'findings_discussion',
    'recommendation_prioritization',
    'offer_fit_questions',
    'closing_script',
  ],
  properties: {
    opening_script: { type: 'string', maxLength: 1200 },
    executive_summary_check: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string', maxLength: 240 },
    },
    scorecard_discussion: {
      type: 'array',
      minItems: 3,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['domain', 'score', 'explanation', 'questions'],
        properties: {
          domain: { type: 'string', maxLength: 100 },
          score: { type: 'string', maxLength: 40 },
          explanation: { type: 'string', maxLength: 500 },
          questions: {
            type: 'array',
            minItems: 2,
            maxItems: 5,
            items: { type: 'string', maxLength: 260 },
          },
        },
      },
    },
    findings_discussion: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['finding', 'questions'],
        properties: {
          finding: { type: 'string', maxLength: 340 },
          questions: {
            type: 'array',
            minItems: 3,
            maxItems: 6,
            items: { type: 'string', maxLength: 260 },
          },
        },
      },
    },
    recommendation_prioritization: {
      type: 'array',
      minItems: 3,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['recommendation', 'questions'],
        properties: {
          recommendation: { type: 'string', maxLength: 220 },
          questions: {
            type: 'array',
            minItems: 3,
            maxItems: 6,
            items: { type: 'string', maxLength: 260 },
          },
        },
      },
    },
    offer_fit_questions: {
      type: 'array',
      minItems: 5,
      maxItems: 10,
      items: { type: 'string', maxLength: 280 },
    },
    closing_script: { type: 'string', maxLength: 1000 },
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
