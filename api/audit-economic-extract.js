import {
  economicExtractPrompt,
  economicSchema,
  getAuditType,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import { getAdvisorAudit, saveEconomicImpact } from './_advisorAuditStore.js';
import { clientEconomicFromRow } from './_economicImpact.js';

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = String(body.audit_id || '').trim();
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const audit = await getAdvisorAudit(auth, auditId);
    if (audit.report?.geo_audit) {
      return res.status(400).json({ error: 'GEO audits do not use the economic opportunity layer.' });
    }
    if (!audit.transcript || audit.transcript.trim().length < 40) {
      return res.status(400).json({ error: 'Add the discovery transcript before extracting economics.' });
    }

    const t = getAuditType(audit.audit_type_key);
    const input = [
      `Client: ${audit.client_name}`,
      `Assessment: ${audit.audit_type_name || t.name}`,
      '',
      'Company research:',
      audit.research || '(none)',
      '',
      'Discovery questions:',
      JSON.stringify(audit.questions || [], null, 2),
      '',
      'Discovery transcript:',
      audit.transcript,
    ].join('\n');

    const extraction = await createStructuredResponse({
      instructions: economicExtractPrompt,
      input,
      schema: economicSchema,
      schemaName: 'advisor_audit_economic_impact',
      maxOutputTokens: 2200,
      reportModel: true,
    });

    const saved = await saveEconomicImpact(auth, audit.id, extraction, { source: 'discovery_transcript' });
    return res.status(200).json({ economic: clientEconomicFromRow(saved), impact_id: saved.id });
  } catch (error) {
    return handleApiError(res, error, 'Economic extraction failed.');
  }
}
