// Vercel Serverless Function: /api/lead
// Routes form submissions → Zoho CRM Leads via Zoho API directly

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const lead = req.body;
    if (!lead.email || !lead.firstName) {
        return res.status(400).json({ error: 'First name and email are required' });
    }

    // Try Composio first, fall back to logging if it fails
    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
    const CONNECTED_ACCOUNT_ID = process.env.COMPOSIO_ZOHO_ACCOUNT_ID || '450c1cf3-f9f4-48bd-9efe-ef2a4df541f9';

    try {
        // Try Composio v2 execute endpoint
        const zohoPayload = {
            connectedAccountId: CONNECTED_ACCOUNT_ID,
            entityId: 'default',
            input: {
                module_api_name: 'Leads',
                data: [{
                    First_Name: lead.firstName || '',
                    Last_Name: lead.lastName || '',
                    Email: lead.email,
                    Phone: lead.phone || '',
                    Company: lead.company || 'Unknown',
                    Description: lead.message || '',
                    Lead_Source: 'Website - Tier4flywheel'
                }]
            }
        };

        const zohoRes = await fetch(
            'https://backend.composio.dev/api/v2/actions/ZOHO_CREATE_ZOHO_RECORD/execute',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': COMPOSIO_API_KEY },
                body: JSON.stringify(zohoPayload)
            }
        );

        const zohoData = await zohoRes.json();

        if (zohoRes.ok && zohoData.successful !== false) {
            console.log('[lead.js] Lead created via Composio:', JSON.stringify(zohoData));
            return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
        }

        // Composio failed — log lead data so nothing is lost
        console.warn('[lead.js] Composio failed, logging lead data:', JSON.stringify({
            timestamp: new Date().toISOString(),
            lead: { ...lead, source: 'Website - Tier4flywheel' },
            composio_error: zohoData
        }));

        // Still return success to user — don't let backend issues show to visitors
        return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });

    } catch (err) {
        console.error('[lead.js] Error:', err.message);
        // Log lead so we don't lose it
        console.log('[lead.js] LEAD_FALLBACK:', JSON.stringify({ ...lead, timestamp: new Date().toISOString() }));
        return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
    }
}
