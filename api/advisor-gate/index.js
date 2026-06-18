import { clearGateCookie, setGateCookie, verifyGatePassword } from '../_advisorGate.js';
import { handleApiError, readJson } from '../_advisorAuditServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJson(req);
    if (!verifyGatePassword(body.password)) {
      clearGateCookie(res);
      return res.status(401).json({ ok: false, error: 'Advisor access was not accepted.' });
    }

    setGateCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return handleApiError(res, error, 'Advisor access is not configured yet.');
  }
}
