/**
 * @deprecated Synchronous report generation — kept for reference only.
 *
 * The live audit pipeline uses the asynchronous background-job flow:
 *   POST /api/audit-report-start   → kicks off background generation
 *   GET  /api/audit-report-status  → polled by the client until completion
 *
 * This synchronous endpoint is NOT called by the client (AdminAuditPage.jsx
 * only references audit-report-start / audit-report-status). Do not extend
 * this file; new report-generation logic belongs on the async path. Safe to
 * remove once Phases 3-5 are verified on the live path.
 */
import {
  getAuditType,
  reportFromEvidencePrompt,
  reportRepairPrompt,
  reportPrompt,
  reportSchema,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import { validateAdvisorReport } from './_advisorAuditValidation.js';

const DIRECT_REPORT_CHAR_LIMIT = 28000;

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
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
    const client = body.client || {};
    const transcript = text(body.transcript);
    const chunkAnalyses = Array.isArray(body.chunkAnalyses) ? body.chunkAnalyses : [];
    const transcriptMeta = body.transcriptMeta || {};

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (!chunkAnalyses.length && transcript.length < 40) {
      return res.status(400).json({ error: 'Paste a longer transcript before generating the report.' });
    }

    const t = getAuditType(client.typeKey);
    let input;
    let instructions = reportPrompt(t);

    if (chunkAnalyses.length) {
      input = [
        `Client: ${clean(client.name, 200)}`,
        `Website: ${clean(client.url, 500) || '(none given)'}`,
        `Assessment: ${t.name}`,
        'Transcript processing: full transcript parsed in chunks before final report generation.',
        `Original transcript characters: ${number(transcriptMeta.original_chars, 0)}`,
        `Original transcript chunks: ${number(transcriptMeta.chunk_count, chunkAnalyses.length)}`,
        '',
        'FULL TRANSCRIPT EVIDENCE PACKETS:',
        JSON.stringify(chunkAnalyses, null, 2),
      ].join('\n');
      instructions = reportFromEvidencePrompt(t);
    } else {
      if (transcript.length > DIRECT_REPORT_CHAR_LIMIT) {
        return res.status(400).json({
          error: 'Long transcript was sent without chunk analysis. Refresh and try again so every transcript part can be processed safely.',
        });
      }

      input = [
        `Client: ${clean(client.name, 200)}`,
        `Website: ${clean(client.url, 500) || '(none given)'}`,
        `Assessment: ${t.name}`,
        '',
        'CALL TRANSCRIPT:',
        transcript,
      ].join('\n');
    }

    const result = await createStructuredResponse({
      instructions,
      input,
      schema: reportSchema,
      schemaName: 'advisor_audit_report',
      maxOutputTokens: 5000,
      reportModel: true,
      validate: validateAdvisorReport,
      repairInstructions: reportRepairPrompt(t),
    });

    if (chunkAnalyses.length) {
      result.transcript_processing = {
        mode: 'full_chunked',
        chunks: number(transcriptMeta.chunk_count, chunkAnalyses.length),
        original_chars: number(transcriptMeta.original_chars, 0),
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(res, error, "Report didn't come back cleanly.");
  }
}
