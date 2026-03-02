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

    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;

    // Log what we have for debugging
    console.log('[lead.js] API key present:', !!COMPOSIO_API_KEY);
    console.log('[lead.js] Lead received:', lead.email, lead.firstName);

    if (!COMPOSIO_API_KEY) {
        console.error('[lead.js] MISSING COMPOSIO_API_KEY - falling back to log');
        // Log lead so nothing is lost
        console.log('[lead.js] LEAD_CAPTURE:', JSON.stringify({...lead, ts: new Date().toISOString()}));
        return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
    }

    // Try both known working connections
    const CONNECTIONS = [
        'd09c7847-42fc-46da-b275-a2169f91cba8',
        '145add7a-8c23-460b-9d81-5bfb05c933c9'
    ];

    const zohoData = {
        First_Name: lead.firstName || '',
        Last_Name: lead.lastName || '',
        Email: lead.email,
        Phone: lead.phone || '',
        Company: lead.company || 'Unknown',
        Description: lead.message || '',
        Lead_Source: 'Website - Tier4flywheel'
    };

    for (const accountId of CONNECTIONS) {
        try {
            console.log('[lead.js] Trying connection:', accountId);
            const zohoRes = await fetch(
                'https://backend.composio.dev/api/v2/actions/ZOHO_CREATE_ZOHO_RECORD/execute',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': COMPOSIO_API_KEY
                    },
                    body: JSON.stringify({
                        connectedAccountId: accountId,
                        entityId: 'default',
                        input: { module_api_name: 'Leads', data: [zohoData] }
                    })
                }
            );

            const result = await zohoRes.json();
            console.log('[lead.js] Connection', accountId, 'result:', result.successful, result.message);

            if (result.successful === true) {
                console.log('[lead.js] SUCCESS with connection:', accountId);
                return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
            }
        } catch (err) {
            console.error('[lead.js] Error with connection', accountId, ':', err.message);
        }
    }

    // All connections failed - log lead so we don't lose it
    console.error('[lead.js] ALL CONNECTIONS FAILED - logging lead:', JSON.stringify({...zohoData, ts: new Date().toISOString()}));
    return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
}
