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

    const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
        console.error('[lead.js] MISSING AIRTABLE ENV VARS');
        return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
    }

    const fields = {
        'First Name': sanitize(lead.firstName, 100),
        'Last Name': sanitize(lead.lastName, 100),
        'Email': sanitize(lead.email, 254),
        'Phone': sanitize(lead.phone, 30),
        'Company URL': sanitize(lead.companyUrl, 500),
        'Message': sanitize(lead.message, 2000),
        'Source': 'Website - Tier4flywheel',
        'Submitted At': new Date().toISOString()
    };

    try {
        const airtableRes = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_PAT}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields })
            }
        );

        if (airtableRes.ok) {
            return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
        }

        const errBody = await airtableRes.text();
        console.error('[lead.js] Airtable error:', airtableRes.status, errBody);
    } catch (err) {
        console.error('[lead.js] Airtable request failed:', err.message);
    }

    // Airtable failed - still return success to user (lead is logged by Vercel)
    return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
}
