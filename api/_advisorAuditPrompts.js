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
      'Early-stage prospect. Tie recommendations to Tier 4 service lines (Strategy & Roadmap, or a small focused pilot) and point to an obvious, low-risk first step. Honest, not flattering.',
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
      "Frame as a build-scoping read: how clear and valuable the problem is, how feasible a solution is, and a recommended approach - buy an existing tool, build custom, or orchestrate both (Tier 4's implementation pattern). Recommendations should move toward a scoped implementation engagement.",
  },
  governance: {
    name: 'Agent Governance',
    bands: '1.0-1.9 Ungoverned | 2.0-2.9 Reactive | 3.0-3.9 Managed | 4.0-4.6 Governed | 4.7-5.0 Optimized',
    domains: [
      'Identity Inventory & Coverage',
      'Effective Access & Least Privilege',
      'Segregation of Duties',
      'Provisioning & Lifecycle',
      'Audit Readiness & Evidence',
    ],
    gov: true,
    focus:
      'how this company governs its AI agents and automated (non-human) identities - inventory, effective access, segregation of duties, lifecycle, and audit-readiness',
    questionGuidance:
      'This is a security or IT leader who ALREADY has agents or automated accounts in play. Questions can be a little more pointed but stay plain-English. Surface their identity stack (Active Directory, Entra, ServiceNow, Saviynt, etc.), whether they have an inventory of agents and automated accounts and who owns them, whether they can see what those accounts can actually access, segregation-of-duties coverage for non-human accounts, what happens to accounts at offboarding, and how painful audits are. Steer toward the governance gaps that Pedigree closes.',
    reportFraming:
      'Audit-grade and precise about systems, identities, access. A mature human IAM program does NOT lift the agent/NHI score. Map recommendations to a Pedigree SKU (Discover/Govern/Enforce) where natural.',
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

Return only JSON matching the requested schema.`;
}

export function reportPrompt(t) {
  return `You are a senior consultant at Tier 4 Intelligence (Alpharetta, GA) writing an "${t.name}" readout from a discovery call transcript. Extract evidence from the transcript yourself. Score these five dimensions 1-5: ${t.domains.join(', ')}. Rubric: 1 absent/ad hoc, 2 recognized but unaddressed, 3 workable foundations, 4 solid/resourced, 5 best-in-class. Bands: ${t.bands}. Overall = mean of the five. If a dimension isn't covered, give a conservative score and say the evidence is thin rather than inventing detail.

${t.reportFraming}

Return only JSON matching the requested schema. Include 5-8 recommendations sorted by impact then effort. Domains must stay in this order: ${t.domains.join(', ')}.`;
}

export const followupPrompt =
  'You are a Tier 4 Intelligence consultant. Write a short, warm post-call follow-up email to the client: thank them, name 1-2 things you heard, and tee up the readout as the next step. Plain text only, no subject line, under 130 words.';

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
  required: ['overall', 'band', 'execSummary', 'topFindings', 'domains', 'recommendations', 'roadmap', 'closing'],
  properties: {
    overall: { type: 'number', minimum: 1, maximum: 5 },
    band: { type: 'string' },
    execSummary: { type: 'string' },
    topFindings: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string' },
    },
    domains: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'score', 'finding', 'meaning', 'rationale'],
        properties: {
          name: { type: 'string' },
          score: { type: 'number', minimum: 1, maximum: 5 },
          finding: { type: 'string' },
          meaning: { type: 'string' },
          rationale: { type: 'string' },
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
        required: ['text', 'effort', 'impact', 'owner'],
        properties: {
          text: { type: 'string' },
          effort: { type: 'string', enum: ['Low', 'Med', 'High'] },
          impact: { type: 'string', enum: ['Low', 'Med', 'High'] },
          owner: { type: 'string' },
        },
      },
    },
    roadmap: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['phase', 'title', 'items'],
        properties: {
          phase: { type: 'string' },
          title: { type: 'string' },
          items: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
      },
    },
    closing: { type: 'string' },
  },
};
