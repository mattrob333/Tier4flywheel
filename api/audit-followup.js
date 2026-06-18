import { followupPrompt, getAuditType } from './_advisorAuditPrompts.js';
import {
  createTextResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const client = body.client || {};
    const report = body.report || {};
    const t = getAuditType(client.typeKey);

    if (!clean(client.name, 200) || !report.overall) {
      return res.status(400).json({ error: 'Client and report are required.' });
    }

    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Assessment: ${t.name}`,
      `Overall: ${report.overall}/5 (${clean(report.band, 100)})`,
      `Top findings: ${(report.topFindings || []).map((x) => clean(x, 300)).join('; ')}`,
    ].join('\n');

    const email = await createTextResponse({
      instructions: followupPrompt,
      input,
      maxOutputTokens: 800,
    });

    return res.status(200).json({ email });
  } catch (error) {
    return handleApiError(res, error, "Couldn't draft the follow-up email.");
  }
}
