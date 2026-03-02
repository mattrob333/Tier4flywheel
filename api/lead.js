export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const lead = req.body;
    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
    const CONNECTED_ACCOUNT_ID = 'd09c7847-42fc-46da-b275-a2169f91cba8';

    // DEBUG: log everything so we can see in Vercel function logs
    console.log('[lead.js] REQUEST RECEIVED:', JSON.stringify({
        method: req.method,
        body: lead,
        hasApiKey: !!COMPOSIO_API_KEY,
        apiKeyPrefix: COMPOSIO_API_KEY ? COMPOSIO_API_KEY.substring(0, 8) : 'MISSING',
        accountId: CONNECTED_ACCOUNT_ID,
        timestamp: new Date().toISOString()
    }));

    if (!lead.email || !lead.firstName) {
        console.log('[lead.js] VALIDATION FAILED - missing email or firstName');
        return res.status(400).json({ error: 'First name and email are required' });
    }

    if (!COMPOSIO_API_KEY) {
        console.error('[lead.js] COMPOSIO_API_KEY IS MISSING - check Vercel env vars');
        return res.status(500).json({ error: 'Server config error: missing API key', debug: 'COMPOSIO_API_KEY not set in Vercel environment' });
    }

    try {
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

        console.log('[lead.js] POSTING TO COMPOSIO:', JSON.stringify(zohoPayload));

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
        console.log('[lead.js] COMPOSIO RESPONSE:', JSON.stringify(zohoData));

        if (zohoData.successful === true) {
            console.log('[lead.js] SUCCESS - Lead created in Zoho');
            return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
        } else {
            console.error('[lead.js] COMPOSIO FAILED:', JSON.stringify(zohoData));
            // Return the actual error so we can debug from the browser
            return res.status(500).json({ 
                error: 'CRM submission failed', 
                detail: zohoData,
                accountId: CONNECTED_ACCOUNT_ID
            });
        }

    } catch (err) {
        console.error('[lead.js] EXCEPTION:', err.message);
        return res.status(500).json({ error: 'Internal error', detail: err.message });
    }
}
