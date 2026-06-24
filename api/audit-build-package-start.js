import {
  buildPackagePrompt,
  buildPackageSchema,
} from './_advisorAuditPrompts.js';
import {
  createBackgroundStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import {
  getAdvisorAudit,
  getAuditReadout,
} from './_advisorAuditStore.js';

function clean(value, max = 60000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

// Kicks off the developer build package as a background job (like the report)
// so the long generation never hits the function timeout. Status is polled by
// /api/audit-build-package-status.
export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = clean(body.audit_id, 80);
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const audit = await getAdvisorAudit(auth, auditId);
    if (!audit.report) return res.status(400).json({ error: 'Generate an audit report before the build package.' });
    if (audit.report?.geo_audit) return res.status(400).json({ error: 'GEO audits do not use build packages.' });

    const proposal = audit.proposal;
    if (!proposal) {
      return res.status(400).json({ error: 'Generate a client proposal before the developer build package.' });
    }

    const readout = await getAuditReadout(auth, audit.id, clean(body.readout_id, 80));

    const input = [
      `Client: ${audit.client_name}`,
      `Audit type: ${audit.audit_type_name || audit.audit_type_key}`,
      '',
      'Company research:',
      audit.research || '',
      '',
      'Discovery transcript (first call):',
      audit.transcript || '',
      '',
      'Audit report JSON:',
      JSON.stringify(audit.report, null, 2),
      '',
      'Readout transcript (second call):',
      readout?.readout_transcript_text || 'Not provided.',
      '',
      'Client proposal JSON:',
      JSON.stringify(proposal.proposal_json || {}, null, 2),
      '',
      'Client proposal text:',
      proposal.proposal_text || '',
    ].join('\n');

    const response = await createBackgroundStructuredResponse({
      instructions: buildPackagePrompt,
      input,
      schema: buildPackageSchema,
      schemaName: 'advisor_build_package',
      maxOutputTokens: 7000,
      reportModel: true,
    });

    return res.status(202).json({
      response_id: response.id,
      status: response.status || 'queued',
    });
  } catch (error) {
    return handleApiError(res, error, 'Could not start the build package.');
  }
}
