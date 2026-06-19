import {
  getAuditType,
  reportPrompt,
  reportSchema,
} from './_advisorAuditPrompts.js';
import {
  createBackgroundStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const client = body.client || {};
    const transcript = text(body.transcript);

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (transcript.length < 40) {
      return res.status(400).json({ error: 'Paste a longer transcript before generating the report.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Website: ${clean(client.url, 500) || '(none given)'}`,
      `Assessment: ${t.name}`,
      `Transcript characters: ${transcript.length}`,
      '',
      'CALL TRANSCRIPT:',
      transcript,
    ].join('\n');

    const response = await createBackgroundStructuredResponse({
      instructions: reportPrompt(t),
      input,
      schema: reportSchema,
      schemaName: 'advisor_audit_report',
      maxOutputTokens: 5000,
      reportModel: true,
    });

    return res.status(202).json({
      response_id: response.id,
      status: response.status || 'queued',
      transcript_chars: transcript.length,
    });
  } catch (error) {
    return handleApiError(res, error, 'Could not start the background audit report.');
  }
}
