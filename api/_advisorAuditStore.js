import { randomUUID } from 'node:crypto';
import {
  auditEconomicFields,
  economicRowFromExtraction,
  isValidValidationStatus,
  toNumber,
  validationOutcomeFields,
} from './_economicImpact.js';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const err = new Error('Supabase audit storage is not configured.');
    err.statusCode = 503;
    err.errorCode = 'SUPABASE_NOT_CONFIGURED';
    throw err;
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
  };
}

async function supabaseFetch(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || 'Supabase request failed.');
    err.statusCode = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function cleanLongText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function bool(value) {
  return value === true;
}

// Reports use a nested { client_report } shape; legacy reports were flat.
function reportClientLayer(report) {
  if (report && typeof report.client_report === 'object' && report.client_report) {
    return report.client_report;
  }
  return report || {};
}

function reportScore(report) {
  const score = Number(reportClientLayer(report)?.overall);
  return Number.isFinite(score) ? score : null;
}

function reportBand(report) {
  return clean(reportClientLayer(report)?.band, 100) || null;
}

function tableAuditFromPayload(auth, payload, id) {
  const client = payload.client || {};
  const research = payload.research || null;
  const report = payload.report || null;

  return {
    id,
    owner_clerk_user_id: auth.userId,
    owner_email: auth.email || '',
    owner_name: auth.name || '',
    client_name: clean(client.name, 250),
    client_url: clean(client.url, 500),
    client_desc: clean(client.desc, 4000),
    audit_type_key: clean(client.typeKey, 80) || 'discovery',
    audit_type_name: clean(client.typeName, 160),
    author_name: clean(client.author, 160),
    research: research?.research || null,
    questions: Array.isArray(research?.questions) ? research.questions : null,
    transcript: cleanLongText(payload.transcript) || null,
    report,
    followup_email: clean(payload.followup, 12000) || null,
    overall_score: reportScore(report),
    score_band: reportBand(report),
    status: clean(payload.status, 80) || 'draft',
    updated_at: new Date().toISOString(),
  };
}

export async function upsertAdvisorProfile(auth) {
  if (!auth.userId) return null;

  const rows = await supabaseFetch('advisor_profiles?on_conflict=clerk_user_id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        clerk_user_id: auth.userId,
        email: auth.email || '',
        name: auth.name || '',
        role: auth.isSuperuser ? 'superuser' : 'advisor',
        updated_at: new Date().toISOString(),
      },
    ]),
  });

  return rows?.[0] || null;
}

export async function saveAdvisorAudit(auth, payload) {
  await upsertAdvisorProfile(auth);

  const requestedId = clean(payload.id, 80);
  const id = requestedId || randomUUID();
  const existing = requestedId ? await getAdvisorAudit(auth, requestedId, { allowMissing: true }) : null;

  if (existing && existing.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You can only update audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const row = tableAuditFromPayload(auth, payload, id);
  const rows = await supabaseFetch('advisor_audits?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([row]),
  });

  return rows?.[0] || row;
}

function latestByAuditId(rows) {
  const map = new Map();
  for (const row of rows || []) {
    if (!map.has(row.audit_id)) map.set(row.audit_id, row);
  }
  return map;
}

async function attachLatestArtifacts(audits) {
  const ids = (audits || []).map((audit) => audit.id).filter(Boolean);
  if (!ids.length) return audits || [];

  const inList = ids.map((id) => encodeURIComponent(id)).join(',');
  let readouts = [];
  let proposals = [];
  let economicImpacts = [];
  try {
    [readouts, proposals, economicImpacts] = await Promise.all([
      supabaseFetch(`audit_readouts?select=*&audit_id=in.(${inList})&order=updated_at.desc`, { method: 'GET' }),
      supabaseFetch(`audit_proposals?select=*&audit_id=in.(${inList})&order=updated_at.desc`, { method: 'GET' }),
      supabaseFetch(`audit_economic_impacts?select=*&audit_id=in.(${inList})&order=updated_at.desc`, { method: 'GET' }),
    ]);
  } catch (error) {
    const message = String(error.message || '');
    if (
      error.statusCode === 404 ||
      message.includes('audit_readouts') ||
      message.includes('audit_proposals') ||
      message.includes('audit_economic_impacts') ||
      message.includes('relation')
    ) {
      return audits;
    }
    throw error;
  }
  const readoutByAudit = latestByAuditId(readouts);
  const proposalByAudit = latestByAuditId(proposals);
  const economicByAudit = latestByAuditId(economicImpacts);

  return audits.map((audit) => ({
    ...audit,
    readout: readoutByAudit.get(audit.id) || null,
    proposal: proposalByAudit.get(audit.id) || null,
    economic_impact: economicByAudit.get(audit.id) || null,
  }));
}

export async function listAdvisorAudits(auth) {
  const path = auth.isSuperuser
    ? 'advisor_audits?select=*&order=updated_at.desc'
    : `advisor_audits?select=*&owner_clerk_user_id=eq.${encodeURIComponent(auth.userId)}&order=updated_at.desc`;

  const audits = await supabaseFetch(path, { method: 'GET' });
  return attachLatestArtifacts(audits);
}

export async function getAdvisorAudit(auth, id, options = {}) {
  const rows = await supabaseFetch(`advisor_audits?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, {
    method: 'GET',
  });
  const row = rows?.[0] || null;

  if (!row) {
    if (options.allowMissing) return null;
    const err = new Error('Audit was not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!auth.isSuperuser && row.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You do not have access to this audit.');
    err.statusCode = 403;
    throw err;
  }

  const [withArtifacts] = await attachLatestArtifacts([row]);
  return withArtifacts || row;
}

export async function deleteAdvisorAudit(auth, id) {
  const row = await getAdvisorAudit(auth, id);

  if (!auth.isSuperuser && row.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You can only delete audits you own.');
    err.statusCode = 403;
    throw err;
  }

  await supabaseFetch(`advisor_audits?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  });

  return row;
}

export async function updateAdvisorAuditSalesStage(auth, id, salesStage) {
  const row = await getAdvisorAudit(auth, id);
  const nextReport = {
    ...(row.report && typeof row.report === 'object' ? row.report : {}),
    sales_stage: clean(salesStage, 80) || 'not_started',
  };

  const rows = await supabaseFetch(`advisor_audits?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      report: nextReport,
      updated_at: new Date().toISOString(),
    }),
  });

  return rows?.[0] || { ...row, report: nextReport };
}

async function patchAuditLifecycle(id, fields) {
  const rows = await supabaseFetch(`advisor_audits?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      ...fields,
      updated_at: new Date().toISOString(),
    }),
  });

  return rows?.[0] || null;
}

function readoutRowFromPayload(auth, audit, payload, id) {
  return {
    id,
    audit_id: audit.id,
    advisor_id: auth.userId,
    client_name: audit.client_name || '',
    readout_guide_json: payload.readout_guide_json || null,
    readout_guide_text: clean(payload.readout_guide_text, 30000) || null,
    readout_transcript_text: cleanLongText(payload.readout_transcript_text) || null,
    advisor_notes: clean(payload.advisor_notes, 30000) || null,
    readout_call_date: clean(payload.readout_call_date, 40) || null,
    participants: clean(payload.participants, 4000) || null,
    client_agreement_level: clean(payload.client_agreement_level, 80) || null,
    client_interest_level: clean(payload.client_interest_level, 80) || null,
    selected_next_step: clean(payload.selected_next_step, 120) || null,
    proposal_requested: bool(payload.proposal_requested),
    prd_requested: bool(payload.prd_requested),
    geo_package_discussed: bool(payload.geo_package_discussed),
    pedigree_demo_discussed: bool(payload.pedigree_demo_discussed),
    budget_discussed: bool(payload.budget_discussed),
    decision_maker_identified: bool(payload.decision_maker_identified),
    timeline_discussed: bool(payload.timeline_discussed),
    objections: Array.isArray(payload.objections) ? payload.objections : [],
    updated_at: new Date().toISOString(),
  };
}

export async function saveAuditReadout(auth, auditId, payload) {
  const audit = await getAdvisorAudit(auth, auditId);
  if (audit.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You can only update readouts for audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const requestedId = clean(payload.readout_id || payload.id, 80);
  const id = requestedId || randomUUID();
  const row = readoutRowFromPayload(auth, audit, payload, id);
  const rows = await supabaseFetch('audit_readouts?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([row]),
  });

  const readout = rows?.[0] || row;
  await patchAuditLifecycle(audit.id, {
    status: payload.status || (row.readout_transcript_text ? 'readout_transcript_added' : 'readout_guide_ready'),
    current_stage: payload.status || (row.readout_transcript_text ? 'readout_transcript_added' : 'readout_guide_ready'),
    readout_status: row.readout_transcript_text ? 'transcript_added' : 'guide_ready',
    selected_next_step: row.selected_next_step,
    client_interest_level: row.client_interest_level,
    client_agreement_level: row.client_agreement_level,
    proposal_requested: row.proposal_requested,
    prd_requested: row.prd_requested,
    pedigree_demo_discussed: row.pedigree_demo_discussed,
    geo_package_discussed: row.geo_package_discussed,
    budget_discussed: row.budget_discussed,
    decision_maker_identified: row.decision_maker_identified,
    timeline_discussed: row.timeline_discussed,
  });

  return readout;
}

export async function getAuditReadout(auth, auditId, readoutId) {
  const audit = await getAdvisorAudit(auth, auditId);
  const path = readoutId
    ? `audit_readouts?select=*&id=eq.${encodeURIComponent(readoutId)}&audit_id=eq.${encodeURIComponent(audit.id)}&limit=1`
    : `audit_readouts?select=*&audit_id=eq.${encodeURIComponent(audit.id)}&order=updated_at.desc&limit=1`;
  const rows = await supabaseFetch(path, { method: 'GET' });
  return rows?.[0] || null;
}

function proposalRowFromPayload(auth, audit, payload, id) {
  return {
    id,
    audit_id: audit.id,
    readout_id: clean(payload.readout_id, 80) || null,
    advisor_id: auth.userId,
    proposal_type: clean(payload.proposal_type, 120) || 'AI Recommended',
    proposal_title: clean(payload.proposal_title, 240) || null,
    proposal_json: payload.proposal_json || null,
    proposal_text: clean(payload.proposal_text, 60000) || null,
    proposal_status: clean(payload.proposal_status, 80) || 'draft',
    selected_recommendations: Array.isArray(payload.selected_recommendations) ? payload.selected_recommendations : [],
    estimated_value: clean(payload.estimated_value, 280) || null,
    pricing_notes: clean(payload.pricing_notes, 2000) || null,
    generated_from_prompt_version: clean(payload.generated_from_prompt_version, 80) || 'proposal_v1',
    generated_model: clean(payload.generated_model, 120) || process.env.OPENAI_AUDIT_REPORT_MODEL || process.env.OPENAI_AUDIT_MODEL || null,
    economic_impact_id: clean(payload.economic_impact_id, 80) || null,
    includes_value_case: Boolean(payload.includes_value_case),
    proposal_investment_low: toNumber(payload.proposal_investment_low),
    proposal_investment_high: toNumber(payload.proposal_investment_high),
    estimated_payback_months_low: toNumber(payload.estimated_payback_months_low),
    estimated_payback_months_high: toNumber(payload.estimated_payback_months_high),
    updated_at: new Date().toISOString(),
  };
}

export async function saveAuditProposal(auth, auditId, payload) {
  const audit = await getAdvisorAudit(auth, auditId);
  if (audit.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You can only update proposals for audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const requestedId = clean(payload.proposal_id || payload.id, 80);
  const id = requestedId || randomUUID();
  const row = proposalRowFromPayload(auth, audit, payload, id);
  const rows = await supabaseFetch('audit_proposals?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([row]),
  });

  const proposal = rows?.[0] || row;
  const stage = proposal.proposal_status === 'sent'
    ? 'proposal_sent'
    : proposal.proposal_status === 'accepted'
      ? 'proposal_accepted'
      : proposal.proposal_status === 'lost'
        ? 'proposal_lost'
        : 'proposal_ready';
  await patchAuditLifecycle(audit.id, {
    status: stage,
    current_stage: stage,
    proposal_status: proposal.proposal_status,
  });

  return proposal;
}

const ECONOMIC_EDITABLE = [
  'annual_cost_estimate',
  'annual_savings_low',
  'annual_savings_high',
  'annual_revenue_opportunity',
  'payback_months_low',
  'payback_months_high',
];

export async function saveEconomicImpact(auth, auditId, extraction, options = {}) {
  const audit = await getAdvisorAudit(auth, auditId);
  if (audit.owner_clerk_user_id !== auth.userId && !auth.isSuperuser) {
    const err = new Error('You can only quantify economics for audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const row = {
    id: randomUUID(),
    ...economicRowFromExtraction(extraction, {
      auditId: audit.id,
      advisorId: auth.userId,
      clientName: audit.client_name,
      auditTypeKey: audit.audit_type_key,
      readoutId: options.readoutId || null,
      source: options.source || 'discovery_transcript',
    }),
  };

  const rows = await supabaseFetch('audit_economic_impacts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([row]),
  });

  const saved = rows?.[0] || row;
  await patchAuditLifecycle(audit.id, auditEconomicFields(saved));
  return saved;
}

export async function getEconomicImpact(auth, auditId) {
  const audit = await getAdvisorAudit(auth, auditId);
  const rows = await supabaseFetch(
    `audit_economic_impacts?select=*&audit_id=eq.${encodeURIComponent(audit.id)}&order=updated_at.desc&limit=1`,
    { method: 'GET' },
  );
  return rows?.[0] || null;
}

// Persist the outcome of the readout "Validate Economics" (Card 3) conversation
// across audit_economic_impacts, audit_readouts, and advisor_audits.
//
// validation_status: 'validated' | 'revised' | 'rejected'
// On 'revised', callers may pass revised_annual_cost + revised savings + confidence.
// On 'validated', validated_annual_cost confirms the existing estimate.
export async function validateEconomicImpact(auth, auditId, payload = {}) {
  const audit = await getAdvisorAudit(auth, auditId);
  if (audit.owner_clerk_user_id !== auth.userId && !auth.isSuperuser) {
    const err = new Error('You can only validate economics for audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const validationStatus = clean(payload.validation_status, 40);
  if (!isValidValidationStatus(validationStatus)) {
    const err = new Error('validation_status must be one of: validated, revised, rejected.');
    err.statusCode = 400;
    throw err;
  }

  // Resolve the economic impact row.
  const impactId = clean(payload.impact_id, 80);
  let impact;
  if (impactId) {
    const rows = await supabaseFetch(
      `audit_economic_impacts?select=*&id=eq.${encodeURIComponent(impactId)}&limit=1`,
      { method: 'GET' },
    );
    impact = rows?.[0];
  } else {
    const rows = await supabaseFetch(
      `audit_economic_impacts?select=*&audit_id=eq.${encodeURIComponent(audit.id)}&order=updated_at.desc&limit=1`,
      { method: 'GET' },
    );
    impact = rows?.[0];
  }
  if (!impact || impact.audit_id !== audit.id) {
    const err = new Error('Economic impact not found for this audit. Extract economics first.');
    err.statusCode = 404;
    throw err;
  }

  // Build the economic_impacts patch.
  const impactFields = {
    status: validationStatus,
    updated_at: new Date().toISOString(),
  };
  if (typeof payload.client_economic_feedback === 'string') {
    impactFields.client_validation_notes = clean(payload.client_economic_feedback, 10000);
  }
  // Revised numbers apply on 'revised' (and may also be sent on 'validated' to confirm).
  if (validationStatus === 'revised') {
    if (payload.annual_cost_estimate !== undefined) impactFields.annual_cost_estimate = toNumber(payload.annual_cost_estimate);
    if (payload.annual_savings_low !== undefined) impactFields.annual_savings_low = toNumber(payload.annual_savings_low);
    if (payload.annual_savings_high !== undefined) impactFields.annual_savings_high = toNumber(payload.annual_savings_high);
    if (typeof payload.confidence === 'string') impactFields.confidence = payload.confidence;
  }

  const updatedImpactRows = await supabaseFetch(
    `audit_economic_impacts?id=eq.${encodeURIComponent(impact.id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(impactFields),
    },
  );
  const updatedImpact = updatedImpactRows?.[0] || { ...impact, ...impactFields };

  // Resolve the readout row (latest for audit, or the one provided).
  const readoutId = clean(payload.readout_id, 80);
  let readout = null;
  if (readoutId) {
    const rows = await supabaseFetch(
      `audit_readouts?select=*&id=eq.${encodeURIComponent(readoutId)}&audit_id=eq.${encodeURIComponent(audit.id)}&limit=1`,
      { method: 'GET' },
    );
    readout = rows?.[0];
  } else {
    const rows = await supabaseFetch(
      `audit_readouts?select=*&audit_id=eq.${encodeURIComponent(audit.id)}&order=updated_at.desc&limit=1`,
      { method: 'GET' },
    );
    readout = rows?.[0];
  }

  const revisedCost = toNumber(payload.revised_annual_cost);
  const validatedCost = toNumber(payload.validated_annual_cost);
  const outcome = validationOutcomeFields(validationStatus);
  // readoutFields carries only the audit_readouts columns (economics_*).
  const readoutFields = {
    economics_discussed: outcome.economics_discussed,
    economics_validated: outcome.economics_validated,
    economics_revised: outcome.economics_revised,
    client_economic_feedback: clean(payload.client_economic_feedback, 10000) || null,
    updated_at: new Date().toISOString(),
  };
  if (validatedCost !== null) readoutFields.validated_annual_cost = validatedCost;
  if (revisedCost !== null) readoutFields.revised_annual_cost = revisedCost;

  let updatedReadout = null;
  if (readout) {
    const rows = await supabaseFetch(
      `audit_readouts?id=eq.${encodeURIComponent(readout.id)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(readoutFields),
      },
    );
    updatedReadout = rows?.[0] || { ...readout, ...readoutFields };
  } else {
    // No readout yet — create a minimal one carrying the validation outcome.
    const newId = randomUUID();
    const newRow = {
      id: newId,
      audit_id: audit.id,
      advisor_id: auth.userId,
      client_name: audit.client_name || '',
      ...readoutFields,
    };
    const rows = await supabaseFetch('audit_readouts?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify([newRow]),
    });
    updatedReadout = rows?.[0] || newRow;
  }

  // Lifecycle: mark advisor_audits.economic_validated + refresh economic summary.
  const lifecycleFields = auditEconomicFields(updatedImpact);
  lifecycleFields.economic_validated = outcome.economic_validated;
  await patchAuditLifecycle(audit.id, lifecycleFields);

  return {
    impact: updatedImpact,
    readout: updatedReadout,
    validation_status: validationStatus,
  };
}

export async function updateEconomicImpact(auth, id, patch = {}) {
  const existing = await supabaseFetch(
    `audit_economic_impacts?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
    { method: 'GET' },
  );
  const current = existing?.[0];
  if (!current) {
    const err = new Error('Economic impact not found.');
    err.statusCode = 404;
    throw err;
  }

  // Ownership is enforced through the parent audit.
  const audit = await getAdvisorAudit(auth, current.audit_id);
  if (audit.owner_clerk_user_id !== auth.userId && !auth.isSuperuser) {
    const err = new Error('You can only edit economics for audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const fields = { updated_at: new Date().toISOString() };
  ECONOMIC_EDITABLE.forEach((key) => {
    if (key in patch) fields[key] = toNumber(patch[key]);
  });
  if (typeof patch.confidence === 'string') fields.confidence = patch.confidence;
  if (typeof patch.status === 'string') fields.status = patch.status;
  if (typeof patch.client_validation_notes === 'string') fields.client_validation_notes = patch.client_validation_notes;
  if (patch.variables && typeof patch.variables === 'object') fields.variables = patch.variables;
  if (Array.isArray(patch.assumptions)) fields.assumptions = patch.assumptions;
  if (Array.isArray(patch.missing_inputs)) fields.missing_inputs = patch.missing_inputs;
  if (Array.isArray(patch.validation_questions)) fields.validation_questions = patch.validation_questions;

  const rows = await supabaseFetch(`audit_economic_impacts?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(fields),
  });

  const updated = rows?.[0] || { ...current, ...fields };
  await patchAuditLifecycle(audit.id, auditEconomicFields(updated));
  return updated;
}
