import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
} from './_advisorAuditServer.js';
import { getEconomicImpact, updateEconomicImpact } from './_advisorAuditStore.js';
import { clientEconomicFromRow } from './_economicImpact.js';

function getUrl(req) {
  return new URL(req.url || '/api/audit-economic-impact', 'http://localhost');
}

export default async function handler(req, res) {
  try {
    const auth = await requireAdvisorAuth(req);

    if (req.method === 'GET') {
      const auditId = String(getUrl(req).searchParams.get('audit_id') || '').trim();
      if (!auditId) return res.status(400).json({ error: 'audit_id is required.' });
      const row = await getEconomicImpact(auth, auditId);
      return res.status(200).json({ economic: row ? clientEconomicFromRow(row) : null, impact_id: row?.id || null });
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const id = String(getUrl(req).searchParams.get('id') || body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Economic impact id is required.' });
      const row = await updateEconomicImpact(auth, id, body);
      return res.status(200).json({ economic: clientEconomicFromRow(row), impact_id: row.id });
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Economic impact request failed.');
  }
}
