import { isGateCookieValid } from '../_advisorGate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  return res.status(200).json({ ok: isGateCookieValid(req) });
}
