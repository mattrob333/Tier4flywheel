import {
  getAuditType,
  reportRepairPrompt,
  reportSchema,
} from './_advisorAuditPrompts.js';
import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
  retrieveBackgroundStructuredResponse,
} from './_advisorAuditServer.js';
import { validateAdvisorReport } from './_advisorAuditValidation.js';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const responseId = clean(body.response_id, 120);
    const client = body.client || {};
    const transcriptMeta = body.transcriptMeta || {};
    const repairAttempted = body.repair_attempted === true;

    if (!responseId) {
      return res.status(400).json({ error: 'Background response id is required.' });
    }

    const t = getAuditType(client.typeKey);
    const result = await retrieveBackgroundStructuredResponse({
      responseId,
      schema: reportSchema,
      schemaName: 'advisor_audit_report',
      maxOutputTokens: 5000,
      reportModel: true,
      validate: validateAdvisorReport,
      repairInstructions: repairAttempted ? undefined : reportRepairPrompt(t),
      repairInBackground: !repairAttempted,
    });

    if (result.status === 'repairing') {
      return res.status(200).json({
        response_id: result.responseId,
        status: 'repairing',
        repair_attempted: true,
      });
    }

    if (result.status !== 'completed') {
      return res.status(200).json({
        response_id: result.responseId,
        status: result.status,
      });
    }

    const report = {
      ...result.result,
      transcript_processing: {
        mode: 'background_full_context',
        original_chars: number(transcriptMeta.original_chars, 0),
      },
    };

    return res.status(200).json({
      response_id: result.responseId,
      status: 'completed',
      report,
    });
  } catch (error) {
    return handleApiError(res, error, 'Could not check the background audit report.');
  }
}
