// Audit lead capture endpoint
// Submits to Google Form which auto-writes to linked response spreadsheet
// Form ID: 1ALiPnOMdilrIIRJhXknVoo4XV1CjtRn57NWwQFFUUsU
// Field IDs: name=1a72e234, email=1de12c9b, company=7b683f14, domain=2a400e43

const FORM_SUBMIT_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeKSRepr7eV42xvR8LQ6zZpJ4edmg-wdV3InfetKrfk-XY5JA/formResponse';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, company, domain, source } = req.body || {};
  const timestamp = new Date().toISOString();

  // Always log as backup
  console.log('AUDIT_LEAD:', JSON.stringify({ email, name, company, domain, source, timestamp }));

  // Submit to Google Form (auto-writes to linked Sheet)
  try {
    const body = new URLSearchParams({
      'entry.1a72e234': name || '',
      'entry.1de12c9b': email || '',
      'entry.7b683f14': company || '',
      'entry.2a400e43': domain || '',
      'entry.source': source || 'inbound',
    });

    await fetch(FORM_SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (err) {
    console.error('LEAD_FORM_ERROR:', err.message);
    // Don't fail -- console.log backup is there
  }

  return res.status(200).json({ success: true });
}
