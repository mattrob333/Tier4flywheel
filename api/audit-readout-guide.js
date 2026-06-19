import {
  readoutGuidePrompt,
  readoutGuideSchema,
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
  getEconomicImpact,
  saveAuditReadout,
} from './_advisorAuditStore.js';
import { buildReadoutGuideText } from './_readoutProposalText.js';
import { toNumber } from './_economicImpact.js';

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = String(body.audit_id || '').trim();
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const audit = await getAdvisorAudit(auth, auditId);
    if (!audit.report) return res.status(400).json({ error: 'Generate an audit report before the readout guide.' });
    if (audit.report?.geo_audit) return res.status(400).json({ error: 'GEO audits do not use readout guides.' });

    const economic = await getEconomicImpact(auth, audit.id).catch(() => null);
    const estimatedCost = toNumber(economic?.annual_cost_estimate);

    const input = [
      `Client: ${audit.client_name}`,
      `Audit type: ${audit.audit_type_name || audit.audit_type_key}`,
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
      estimatedCost !== null
        ? `Estimated annual cost of the problem (use this exact number in economic_validation.estimated_annual_cost): ${estimatedCost}`
        : 'No economic estimate is available yet; set economic_validation.estimated_annual_cost to null and ask questions that help quantify it.',
    ].join('\n');

    const guide = await createStructuredResponse({
      instructions: readoutGuidePrompt,
      input,
      schema: readoutGuideSchema,
      schemaName: 'advisor_readout_guide',
      maxOutputTokens: 5000,
      reportModel: true,
    });
    // Trust the stored estimate over the model for the headline number.
    if (estimatedCost !== null && guide.economic_validation) {
      guide.economic_validation.estimated_annual_cost = estimatedCost;
    }
    const guideText = buildReadoutGuideText(guide);
    const readout = await saveAuditReadout(auth, audit.id, {
      readout_id: body.readout_id,
      readout_guide_json: guide,
      readout_guide_text: guideText,
      status: 'readout_guide_ready',
    });

    return res.status(200).json({ guide, guide_text: guideText, readout });
  } catch (error) {
    return handleApiError(res, error, 'Readout guide request failed.');
  }
}
