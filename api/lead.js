// Serverless function example for handling the lead generation API layer
// Deploys to Vercel as /api/lead or adapt for Netlify / Cloudflare

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const lead = req.body;

    // Validate
    if (!lead.email || !lead.firstName || !lead.lastName) {
        return res.status(400).json({ error: 'Name and email required' });
    }

    // Build webhook list from env vars
    const webhooks = [];

    // Zoho CRM Webhook Integration Pattern (Preferred over raw OAuth APIs for landing pages)
    if (process.env.WEBHOOK_ZOHO_CRM) {
        webhooks.push({
            url: process.env.WEBHOOK_ZOHO_CRM,
            name: 'Zoho CRM',
            transform: (data) => ({
                // Zoho often expects a specific structured JSON array for Leads
                data: [{
                    "First_Name": data.firstName,
                    "Last_Name": data.lastName,
                    "Email": data.email,
                    "Phone": data.phone || "",
                    "Company": data.company || "Unknown Company",
                    "Description": data.message || "",
                    "Lead_Source": "Website Integration"
                }]
            })
        });
    }

    if (process.env.WEBHOOK_SLACK) {
        webhooks.push({
            url: process.env.WEBHOOK_SLACK,
            name: 'Slack',
            transform: (data) => ({
                text: `🔔 New Lead: ${data.firstName} ${data.lastName} (${data.email}) — ${data.company || 'No company'} — Msg: ${data.message}`
            })
        });
    }

    // Fan out to all configured destinations
    const results = await Promise.allSettled(
        webhooks.map(async (hook) => {
            const payload = hook.transform ? hook.transform(lead) : lead;

            // Console log simulation of the outgoing payload for local testing
            console.log(`[API MOCK] Firing POST to ${hook.name} webhook with payload:`, JSON.stringify(payload, null, 2));

            /* 
            // Real fetch execution (commented out until env vars exist)
            const response = await fetch(hook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            return { name: hook.name, status: response.status };
            */
            return { name: hook.name, status: 200 }; // Mock success
        })
    );

    return res.status(200).json({ success: true, message: 'Lead captured successfully.', results });
}
