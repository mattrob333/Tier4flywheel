import {
  onePagerPrompt,
  onePagerSchema,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import {
  getAdvisorAudit,
  saveAuditProposal,
} from './_advisorAuditStore.js';
import { buildOnePagerText } from './_readoutProposalText.js';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = clean(body.audit_id, 80);
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const audit = await getAdvisorAudit(auth, auditId);
    if (!audit.report) return res.status(400).json({ error: 'Generate an audit report before the executive summary.' });
    if (audit.report?.geo_audit) return res.status(400).json({ error: 'GEO audits do not use the executive summary.' });

    const input = [
      `Client: ${audit.client_name}`,
      `Audit type: ${audit.audit_type_name || audit.audit_type_key}`,
      '',
      'Company research:',
      audit.research || '',
      '',
      'Discovery transcript:',
      audit.transcript || '',
      '',
      'Audit report JSON:',
      JSON.stringify(audit.report, null, 2),
    ];

    if (audit.proposal?.proposal_text) {
      input.push('', 'Current proposal:', audit.proposal.proposal_text);
    }
    if (audit.readout?.readout_transcript_text) {
      input.push('', 'Second-call transcript:', audit.readout.readout_transcript_text);
    }
    if (audit.economic_impact) {
      const ei = audit.economic_impact;
      input.push(
        '',
        'Economic impact (only cite numbers from here):',
        JSON.stringify({
          status: ei.status,
          confidence: ei.confidence,
          annual_cost_estimate: ei.annual_cost_estimate,
          annual_savings_low: ei.annual_savings_low,
          annual_savings_high: ei.annual_savings_high,
        }, null, 2),
      );
    }

    const onePager = await createStructuredResponse({
      instructions: onePagerPrompt,
      input: input.join('\n'),
      schema: onePagerSchema,
      schemaName: 'advisor_one_pager',
      maxOutputTokens: 1500,
      reportModel: true,
    });
    const onePagerText = buildOnePagerText(onePager, audit.client_name);

    // Persist alongside the proposal so it reloads with the audit.
    if (audit.proposal?.id) {
      const mergedJson = {
        ...(audit.proposal.proposal_json && typeof audit.proposal.proposal_json === 'object'
          ? audit.proposal.proposal_json
          : {}),
        one_pager: onePager,
        one_pager_text: onePagerText,
      };
      try {
        await saveAuditProposal(auth, audit.id, {
          proposal_id: audit.proposal.id,
          proposal_json: mergedJson,
          proposal_status: audit.proposal.proposal_status || 'draft',
        });
      } catch (error) {
        console.warn('[audit-one-pager] could not persist one-pager', error?.message || error);
      }
    }

    return res.status(200).json({ one_pager: onePager, one_pager_text: onePagerText });
  } catch (error) {
    return handleApiError(res, error, 'Executive summary request failed.');
  }
}
