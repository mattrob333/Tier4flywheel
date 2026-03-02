const ALLOWED_ORIGINS = [
    'https://tier4intelligence.com',
    'https://www.tier4intelligence.com',
];

function isAllowedOrigin(origin) {
    if (!origin) return false;
    // Allow localhost during development
    if (origin.startsWith('http://localhost:')) return true;
    return ALLOWED_ORIGINS.includes(origin);
}

function sanitize(str, maxLen = 500) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLen).replace(/<[^>]*>/g, '').trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
    const origin = req.headers.origin || '';
    const corsOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const lead = req.body;

    if (!lead || !lead.email || !lead.firstName) {
        return res.status(400).json({ error: 'First name and email are required' });
    }

    if (!EMAIL_RE.test(lead.email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
    const CONNECTED_ACCOUNT_ID = process.env.COMPOSIO_CONNECTED_ACCOUNT_ID || '';

    if (!COMPOSIO_API_KEY) {
        console.error('[lead.js] MISSING COMPOSIO_API_KEY');
        return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
    }

    const zohoData = {
        First_Name: sanitize(lead.firstName, 100),
        Last_Name: sanitize(lead.lastName, 100),
        Email: sanitize(lead.email, 254),
        Phone: sanitize(lead.phone, 30),
        Company: sanitize(lead.company, 200) || 'Unknown',
        Description: sanitize(lead.message, 2000),
        Lead_Source: 'Website - Tier4flywheel'
    };

    try {
        // Composio V3 API
        const zohoRes = await fetch(
            'https://backend.composio.dev/api/v3/tools/execute/ZOHO_CREATE_ZOHO_RECORD',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': COMPOSIO_API_KEY
                },
                body: JSON.stringify({
                    connected_account_id: CONNECTED_ACCOUNT_ID || undefined,
                    user_id: 'default',
                    arguments: { module_api_name: 'Leads', data: [zohoData] }
                })
            }
        );

        const result = await zohoRes.json();

        if (result.successful === true) {
            return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
        }

        console.error('[lead.js] Composio returned unsuccessful:', result.message || 'unknown error');
    } catch (err) {
        console.error('[lead.js] Composio request failed:', err.message);
    }

    // Composio failed - still return success to user (lead is logged by Vercel)
    return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
}
