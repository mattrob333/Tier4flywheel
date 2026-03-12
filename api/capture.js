export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, name, company, domain, timestamp } = req.body || {};
  console.log('AUDIT_LEAD:', JSON.stringify({ email, name, company, domain, timestamp }));
  return res.status(200).json({ success: true });
}
