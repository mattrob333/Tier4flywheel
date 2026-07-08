import {
  proposalDraftPrompt,
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

    // Draft mode: generated right after the first call, from research + discovery
    // transcript + report only. It is the document the advisor reviews with the
    // client on the second call. Final mode additionally requires that call's
    // transcript and lists what changed vs the reviewed draft.
    const isDraft = body.mode === 'draft';

    const readout = await getAuditReadout(auth, audit.id, clean(body.readout_id, 80));
    if (!isDraft && !readout?.readout_transcript_text) {
      return res.status(400).json({ error: 'Add the second-call transcript before generating the final proposal.' });
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
    ];

    if (!isDraft) {
      input.push(
        '',
        'Proposal draft reviewed with the client on the second call:',
        audit.proposal?.proposal_text || clean(body.draft_proposal_text, 60000) || '(no draft was saved)',
        '',
        'Second-call transcript:',
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
          economics_validated: readout.economics_validated,
          economics_revised: readout.economics_revised,
          validated_annual_cost: readout.validated_annual_cost,
          revised_annual_cost: readout.revised_annual_cost,
        }, null, 2),
      );
    }

    if (audit.economic_impact) {
      const ei = audit.economic_impact;
      input.push(
        '',
        'Validated economic impact (use these numbers in the value_case block when available):',
        JSON.stringify({
          status: ei.status,
          confidence: ei.confidence,
          currency: ei.currency,
          annual_cost_estimate: ei.annual_cost_estimate,
          annual_savings_low: ei.annual_savings_low,
          annual_savings_high: ei.annual_savings_high,
          annual_revenue_opportunity: ei.annual_revenue_opportunity,
          payback_months_low: ei.payback_months_low,
          payback_months_high: ei.payback_months_high,
          formula: ei.formulas,
          evidence_quotes: ei.evidence_quotes,
          assumptions: ei.assumptions,
          missing_inputs: ei.missing_inputs,
          validation_status: ei.validation_status,
          client_validation_notes: ei.client_validation_notes,
        }, null, 2),
      );
    } else {
      input.push('', 'Economic impact: not yet extracted. Set value_case confidence to Low and explain what is missing.');
    }

    const inputText = input.join('\n');

    const proposalJson = await createStructuredResponse({
      instructions: isDraft ? proposalDraftPrompt : proposalPrompt,
      input: inputText,
      schema: proposalSchema,
      schemaName: 'advisor_proposal',
      maxOutputTokens: 6500,
      reportModel: true,
    });
    const proposalText = buildProposalText(proposalJson);
    const valueCase = proposalJson.value_case || null;
    const proposal = await saveAuditProposal(auth, audit.id, {
      proposal_id: audit.proposal?.id || undefined,
      readout_id: readout?.id || null,
      proposal_type: proposalJson.proposal_type,
      proposal_title: proposalJson.proposal_title,
      proposal_json: proposalJson,
      proposal_text: proposalText,
      proposal_status: 'draft',
      selected_recommendations: body.selected_recommendations,
      pricing_notes: proposalJson.pricing_notes,
      generated_from_prompt_version: isDraft ? 'proposal_draft_v1' : 'proposal_v3',
      economic_impact_id: audit.economic_impact?.id || null,
      includes_value_case: Boolean(valueCase),
      proposal_investment_low: valueCase?.investment_low ?? null,
      proposal_investment_high: valueCase?.investment_high ?? null,
      estimated_payback_months_low: valueCase?.payback_months_low ?? null,
      estimated_payback_months_high: valueCase?.payback_months_high ?? null,
      estimated_value: valueCase?.headline || null,
    });

    return res.status(200).json({ proposal_json: proposalJson, proposal_text: proposalText, proposal });
  } catch (error) {
    return handleApiError(res, error, 'Proposal request failed.');
  }
}
