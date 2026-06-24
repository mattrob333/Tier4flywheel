import { buildPackageSchema } from './_advisorAuditPrompts.js';
import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
  retrieveBackgroundStructuredResponse,
} from './_advisorAuditServer.js';
import {
  getAdvisorAudit,
  saveAuditProposal,
} from './_advisorAuditStore.js';
import { buildBuildPackageText } from './_readoutProposalText.js';

function clean(value, max = 120) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const responseId = clean(body.response_id, 200);
    const auditId = clean(body.audit_id, 80);
    if (!responseId) return res.status(400).json({ error: 'Background response id is required.' });
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const result = await retrieveBackgroundStructuredResponse({
      responseId,
      schema: buildPackageSchema,
      schemaName: 'advisor_build_package',
      maxOutputTokens: 7000,
      reportModel: true,
    });

    if (result.status !== 'completed') {
      return res.status(200).json({ status: result.status, response_id: result.responseId });
    }

    const audit = await getAdvisorAudit(auth, auditId);
    const buildPackage = result.result;
    const buildPackageText = buildBuildPackageText(buildPackage, audit.client_name);

    // Persist alongside the existing proposal so it reloads with the audit.
    const proposal = audit.proposal;
    let saved = proposal;
    if (proposal) {
      const mergedJson = {
        ...(proposal.proposal_json && typeof proposal.proposal_json === 'object' ? proposal.proposal_json : {}),
        build_package: buildPackage,
        build_package_text: buildPackageText,
      };
      try {
        saved = await saveAuditProposal(auth, audit.id, {
          proposal_id: proposal.id,
          readout_id: proposal.readout_id || undefined,
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
        console.warn('[audit-build-package-status] could not persist build package', error?.message || error);
      }
    }

    return res.status(200).json({
      status: 'completed',
      build_package: buildPackage,
      build_package_text: buildPackageText,
      proposal: saved,
    });
  } catch (error) {
    return handleApiError(res, error, 'Could not check the build package.');
  }
}
