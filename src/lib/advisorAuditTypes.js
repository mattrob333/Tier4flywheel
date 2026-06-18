export const AUDIT_TYPES = {
  discovery: {
    name: 'AI Discovery',
    tagline: 'First conversation with someone curious about AI',
    desc:
      "They're interested in AI but not sure where to start - no specific project yet. Use this for most first calls.",
    domains: [
      'Processes & Workflows',
      'Data & Quality',
      'Tools & Technology',
      'Team & AI Maturity',
      'Leadership & Strategy',
    ],
  },
  solution: {
    name: 'AI Solution Scoping',
    tagline: 'They have a specific problem they think AI can solve',
    desc:
      "They've named a pain point, process, automation, or tool idea. Use this to scope feasibility, value, systems, and data.",
    domains: [
      'Problem Clarity & Value',
      'Current Workflow & Process',
      'Data & Systems Involved',
      'Technical Feasibility',
      'Business Case & Sponsorship',
    ],
  },
  governance: {
    name: 'Agent Governance',
    tagline: 'They already run AI agents and need to govern them',
    desc:
      'A security-minded conversation for agent and non-human identity governance: inventory, access, lifecycle, SoD, and audit evidence.',
    domains: [
      'Identity Inventory & Coverage',
      'Effective Access & Least Privilege',
      'Segregation of Duties',
      'Provisioning & Lifecycle',
      'Audit Readiness & Evidence',
    ],
  },
};

export function getAuditType(typeKey) {
  return AUDIT_TYPES[typeKey] || AUDIT_TYPES.discovery;
}
