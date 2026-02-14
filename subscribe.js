export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
        console.error('Missing Beehiiv credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(
            `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BEEHIIV_API_KEY}`
                },
                body: JSON.stringify({
                    email: email,
                    reactivate_existing: true,
                    send_welcome_email: true,
                    utm_source: 'prompt-library',
                    utm_medium: 'web',
                    utm_campaign: 'free-prompts'
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Beehiiv API error:', data);
            return res.status(response.status).json({ error: data.message || 'Subscription failed' });
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ error: 'Failed to subscribe' });
    }
}
