import { clearGateCookie } from '../_advisorGate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  clearGateCookie(res);
  return res.status(200).json({ ok: true });
}
