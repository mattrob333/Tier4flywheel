import {
  deleteAdvisorAudit,
  getAdvisorAudit,
  listAdvisorAudits,
  saveAdvisorAudit,
  updateAdvisorAuditSalesStage,
} from './_advisorAuditStore.js';
import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
} from './_advisorAuditServer.js';

function getUrl(req) {
  return new URL(req.url || '/api/advisor-audits', 'http://localhost');
}

function withOwnership(auth, audit) {
  return {
    ...audit,
    is_owner: audit.owner_clerk_user_id === auth.userId,
  };
}

export default async function handler(req, res) {
  try {
    const auth = await requireAdvisorAuth(req);

    if (req.method === 'GET') {
      const id = getUrl(req).searchParams.get('id');
      if (id) {
        const audit = await getAdvisorAudit(auth, id);
        return res.status(200).json({
          audit: withOwnership(auth, audit),
          isSuperuser: auth.isSuperuser,
        });
      }

      const audits = await listAdvisorAudits(auth);
      return res.status(200).json({
        audits: audits.map((audit) => withOwnership(auth, audit)),
        isSuperuser: auth.isSuperuser,
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const audit = await saveAdvisorAudit(auth, body);
      return res.status(200).json({
        audit: withOwnership(auth, audit),
        isSuperuser: auth.isSuperuser,
      });
    }

    if (req.method === 'PATCH') {
      const id = getUrl(req).searchParams.get('id');
      if (!id) return res.status(400).json({ error: 'Audit id is required.' });

      const body = await readJson(req);
      const audit = await updateAdvisorAuditSalesStage(auth, id, body.salesStage);
      return res.status(200).json({
        audit: withOwnership(auth, audit),
        isSuperuser: auth.isSuperuser,
      });
    }

    if (req.method === 'DELETE') {
      const id = getUrl(req).searchParams.get('id');
      if (!id) return res.status(400).json({ error: 'Audit id is required.' });

      const audit = await deleteAdvisorAudit(auth, id);
      return res.status(200).json({
        ok: true,
        audit: withOwnership(auth, audit),
        isSuperuser: auth.isSuperuser,
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Audit storage request failed.');
  }
}
