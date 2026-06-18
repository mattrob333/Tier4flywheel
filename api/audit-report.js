import {
  getAuditType,
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

function clean(value, max = 80000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const client = body.client || {};
    const transcript = clean(body.transcript);

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (transcript.length < 40) {
      return res.status(400).json({ error: 'Paste a longer transcript before generating the report.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Assessment: ${t.name}`,
      '',
      'CALL TRANSCRIPT:',
      transcript,
    ].join('\n');

    const result = await createStructuredResponse({
      instructions: reportPrompt(t),
      input,
      schema: reportSchema,
      schemaName: 'advisor_audit_report',
      maxOutputTokens: 4000,
      reportModel: true,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(res, error, "Report didn't come back cleanly.");
  }
}
