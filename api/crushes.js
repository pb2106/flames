// Vercel Serverless Function: GET /api/crushes
// Exposes stored crush confessions for the Secret Admin Vault

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        // Return structured sample / serverless logs
        return res.status(200).json({
            success: true,
            totalCount: 142,
            growthPct: "+28% today",
            topOutcome: "LOVERS (38%)",
            topTarget: "Ethan Brooks (6 entries)",
            unreadCount: 3
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
