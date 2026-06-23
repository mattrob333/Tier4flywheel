import {
  buildPackagePrompt,
  buildPackageSchema,
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
  getAuditReadout,
  saveAuditProposal,
} from './_advisorAuditStore.js';
import { buildBuildPackageText } from './_readoutProposalText.js';

function clean(value, max = 60000) {
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

    const buildPackage = await createStructuredResponse({
      instructions: buildPackagePrompt,
      input,
      schema: buildPackageSchema,
      schemaName: 'advisor_build_package',
      maxOutputTokens: 7000,
      reportModel: true,
    });

    const buildPackageText = buildBuildPackageText(buildPackage, audit.client_name);

    // Persist alongside the existing proposal so it reloads with the audit.
    // No schema migration needed: the package lives inside proposal_json.
    const mergedJson = {
      ...(proposal.proposal_json && typeof proposal.proposal_json === 'object' ? proposal.proposal_json : {}),
      build_package: buildPackage,
      build_package_text: buildPackageText,
    };

    let saved = proposal;
    try {
      saved = await saveAuditProposal(auth, audit.id, {
        proposal_id: proposal.id,
        readout_id: proposal.readout_id || readout?.id || undefined,
        proposal_type: proposal.proposal_type,
        proposal_title: proposal.proposal_title,
        proposal_json: mergedJson,
        proposal_text: proposal.proposal_text,
        proposal_status: proposal.proposal_status || 'draft',
        pricing_notes: proposal.pricing_notes || '',
        economic_impact_id: proposal.economic_impact_id || null,
        includes_value_case: Boolean(proposal.includes_value_case),
      });
    } catch (error) {
      // Persisting is best-effort; still return the generated package.
      console.warn('[audit-build-package] could not persist build package', error?.message || error);
    }

    return res.status(200).json({
      build_package: buildPackage,
      build_package_text: buildPackageText,
      proposal: saved,
    });
  } catch (error) {
    return handleApiError(res, error, 'Build package request failed.');
  }
}
