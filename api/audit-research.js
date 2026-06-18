import {
  getAuditType,
  researchPrompt,
  researchSchema,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
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
    const companyName = clean(client.name, 200);

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Company: ${companyName}`,
      `Website: ${clean(client.url, 500) || '(none given)'}`,
      `What we know: ${clean(client.desc, 2000) || '(brief)'}`,
      `Assessment: ${t.name}`,
    ].join('\n');

    const result = await createStructuredResponse({
      instructions: researchPrompt(t),
      input,
      schema: researchSchema,
      schemaName: 'advisor_audit_research',
      webSearch: true,
      maxOutputTokens: 3000,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(res, error, "Research didn't come back cleanly.");
  }
}
