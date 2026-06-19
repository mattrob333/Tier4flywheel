import {
  proposalPrompt,
  proposalSchema,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
} from './_advisorAuditServer.js';
import {
  getAdvisorAudit,
  getAuditReadout,
  saveAuditProposal,
} from './_advisorAuditStore.js';
import { buildProposalText } from './_readoutProposalText.js';

function clean(value, max = 60000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function getUrl(req) {
  return new URL(req.url || '/api/audit-proposal', 'http://localhost');
}

export default async function handler(req, res) {
  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = clean(body.audit_id || getUrl(req).searchParams.get('audit_id'), 80);
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    if (req.method === 'PATCH') {
      const proposal = await saveAuditProposal(auth, auditId, {
        ...body,
        proposal_id: body.proposal_id || body.id,
        proposal_status: clean(body.proposal_status, 80) || 'draft',
      });
      return res.status(200).json({ proposal });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const audit = await getAdvisorAudit(auth, auditId);
    if (!audit.report) return res.status(400).json({ error: 'Generate an audit report before a proposal.' });
    if (audit.report?.geo_audit) return res.status(400).json({ error: 'GEO audits do not use advisor proposals.' });

    const readout = await getAuditReadout(auth, audit.id, clean(body.readout_id, 80));
    if (!readout?.readout_transcript_text) {
      return res.status(400).json({ error: 'Add the readout transcript before generating a proposal.' });
    }

    const input = [
      `Client: ${audit.client_name}`,
      `Audit type: ${audit.audit_type_name || audit.audit_type_key}`,
      `Requested proposal type: ${clean(body.proposal_type, 120) || 'AI recommend'}`,
      '',
      'Company research:',
      audit.research || '',
      '',
      'Discovery questions:',
      JSON.stringify(audit.questions || [], null, 2),
      '',
      'Discovery transcript:',
      audit.transcript || '',
      '',
      'Audit report JSON:',
      JSON.stringify(audit.report, null, 2),
      '',
      'Readout guide:',
      readout.readout_guide_text || JSON.stringify(readout.readout_guide_json || {}, null, 2),
      '',
      'Readout transcript:',
      readout.readout_transcript_text || '',
      '',
      'Advisor notes and outcome fields:',
      JSON.stringify({
        advisor_notes: readout.advisor_notes,
        client_agreement_level: readout.client_agreement_level,
        client_interest_level: readout.client_interest_level,
        selected_next_step: readout.selected_next_step,
        proposal_requested: readout.proposal_requested,
        prd_requested: readout.prd_requested,
        geo_package_discussed: readout.geo_package_discussed,
        pedigree_demo_discussed: readout.pedigree_demo_discussed,
        budget_discussed: readout.budget_discussed,
        decision_maker_identified: readout.decision_maker_identified,
        timeline_discussed: readout.timeline_discussed,
        objections: readout.objections,
      }, null, 2),
    ].join('\n');

    const proposalJson = await createStructuredResponse({
      instructions: proposalPrompt,
      input,
      schema: proposalSchema,
      schemaName: 'advisor_proposal',
      maxOutputTokens: 6500,
      reportModel: true,
    });
    const proposalText = buildProposalText(proposalJson);
    const proposal = await saveAuditProposal(auth, audit.id, {
      readout_id: readout.id,
      proposal_type: proposalJson.proposal_type,
      proposal_title: proposalJson.proposal_title,
      proposal_json: proposalJson,
      proposal_text: proposalText,
      proposal_status: 'draft',
      selected_recommendations: body.selected_recommendations,
      pricing_notes: proposalJson.pricing_notes,
      generated_from_prompt_version: 'proposal_v1',
    });

    return res.status(200).json({ proposal_json: proposalJson, proposal_text: proposalText, proposal });
  } catch (error) {
    return handleApiError(res, error, 'Proposal request failed.');
  }
}
