// Vercel Serverless Function: /api/lead
// Routes form submissions → Zoho CRM Leads via Composio

export default async function handler(req, res) {
    // CORS headers (allow same-origin + Vercel preview URLs)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const lead = req.body;

    // Validate required fields
    if (!lead.email || !lead.firstName) {
        return res.status(400).json({ error: 'First name and email are required' });
    }

    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
    const CONNECTED_ACCOUNT_ID = '145add7a-8c23-460b-9d81-5bfb05c933c9';

    if (!COMPOSIO_API_KEY) {
        console.error('[lead.js] COMPOSIO_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const zohoPayload = {
            connectedAccountId: CONNECTED_ACCOUNT_ID,
            entityId: 'default',
            input: {
                module_api_name: 'Leads',
                data: [
                    {
                        First_Name: lead.firstName || '',
                        Last_Name: lead.lastName || '',
                        Email: lead.email,
                        Phone: lead.phone || '',
                        Company: lead.company || 'Unknown',
                        Description: lead.message || '',
                        Lead_Source: 'Website - Tier4flywheel'
                    }
                ]
            }
        };

        const zohoRes = await fetch(
            'https://backend.composio.dev/api/v2/actions/ZOHO_CREATE_ZOHO_RECORD/execute',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': COMPOSIO_API_KEY
                },
                body: JSON.stringify(zohoPayload)
            }
        );

        const zohoData = await zohoRes.json();

        if (!zohoRes.ok) {
            console.error('[lead.js] Zoho/Composio error:', zohoData);
            return res.status(502).json({ error: 'CRM submission failed', detail: zohoData });
        }

        console.log('[lead.js] Lead created in Zoho:', JSON.stringify(zohoData));
        return res.status(200).json({ success: true, message: 'Lead captured successfully.' });

    } catch (err) {
        console.error('[lead.js] Unexpected error:', err);
        return res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
}
