import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { appendOrderToSheet, getExistingCodes } from '@/lib/google-sheets';

// Helper to generate a unique 4-digit code e.g. AL-9482
function generateUniqueCode(existingCodes: string[]): string {
  let code = '';
  let isUnique = false;
  const upperCodes = existingCodes.map((c) => c.toUpperCase());
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `AL-${randomNum}`;
    isUnique = !upperCodes.includes(code.toUpperCase());
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, source } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const lead = {
      name: name.trim(),
      phone: phone.trim(),
      source: source || 'Сайт Alser',
      date: new Date().toISOString(),
    };

    // 1. Save lead locally to .ai-context/leads.json (backup - ignore if read-only)
    try {
      const dirPath = path.join(process.cwd(), '.ai-context');
      const filePath = path.join(dirPath, 'leads.json');

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      let leads: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          const fileData = fs.readFileSync(filePath, 'utf8');
          leads = JSON.parse(fileData);
        } catch (e) {
          console.error('Failed to parse leads.json, resetting list:', e);
        }
      }

      leads.push(lead);
      fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
      console.log(`[Site Lead Saved] Saved lead locally from site: ${lead.phone}`);
    } catch (fsError) {
      console.warn('[Site Lead Saved] Could not save lead locally (read-only filesystem on Vercel)');
    }

    // 2. Generate unique tracking code
    // Try to fetch existing codes from Google Sheets first; fall back to local orders.json
    let existingCodes: string[] = [];
    try {
      existingCodes = await getExistingCodes();
      console.log(`[Leads API] Fetched ${existingCodes.length} existing codes from Google Sheets`);
    } catch (sheetsError) {
      console.warn('[Leads API] Could not fetch codes from Sheets, falling back to local orders.json');
      const ordersPath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(ordersPath)) {
        try {
          const localOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
          existingCodes = localOrders.map((o: any) => o.code || '');
        } catch (e) {
          console.error('Failed to parse orders.json:', e);
        }
      }
    }

    const uniqueCode = generateUniqueCode(existingCodes);

    // 3. Append order to Google Sheets (primary CRM)
    try {
      await appendOrderToSheet({
        code: uniqueCode,
        phone: lead.phone,
        createdAt: lead.date,
      });
      console.log(`[Leads API] Order ${uniqueCode} appended to Google Sheets`);
    } catch (sheetError) {
      console.error('[Leads API] Failed to append to Google Sheets:', sheetError);
    }

    // 4. Also save to local orders.json (fallback/backup - ignore if read-only)
    try {
      const ordersPath = path.join(process.cwd(), 'src/data/orders.json');
      let orders: any[] = [];

      const ordersDir = path.dirname(ordersPath);
      if (!fs.existsSync(ordersDir)) {
        fs.mkdirSync(ordersDir, { recursive: true });
      }

      if (fs.existsSync(ordersPath)) {
        try {
          const fileContent = fs.readFileSync(ordersPath, 'utf8');
          orders = JSON.parse(fileContent);
        } catch (e) {
          console.error('Failed to parse orders.json, resetting list:', e);
        }
      }

      const newOrder = {
        phone: lead.phone,
        code: uniqueCode,
        status: 'in_progress',
        createdAt: lead.date,
      };

      orders.push(newOrder);
      fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
      console.log(`[Order Saved] Saved new order locally: ${uniqueCode} for ${lead.phone}`);
    } catch (fsError) {
      console.warn('[Order Saved] Could not save order locally (read-only filesystem on Vercel)');
    }

    // 5. Send notification via Telegram Bot to Admin chat (including the secret code)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    console.log(`[Leads API] botToken: ${botToken ? 'present' : 'missing'}, adminChatId: ${adminChatId}`);

    if (botToken && adminChatId) {
      const messageText = `🚨 <b>Нова заявка з сайту!</b>\n\n` +
                          `👤 <b>Клієнт:</b> ${lead.name}\n` +
                          `📞 <b>Телефон:</b> <code>${lead.phone}</code>\n` +
                          `🌐 <b>Джерело:</b> ${lead.source}\n` +
                          `🔑 <b>Код відстеження:</b> <code>${uniqueCode}</code>`;

      try {
        const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: Number(adminChatId),
            text: messageText,
            parse_mode: 'HTML',
          }),
        });

        if (!telegramRes.ok) {
          const errText = await telegramRes.text();
          console.error(`Telegram API error when sending site lead: ${telegramRes.status} - ${errText}`);
        }
      } catch (tgError) {
        console.error('Failed to send lead notification to Telegram:', tgError);
      }
    }

    // CRITICAL: Do NOT return the tracking code in the response
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in leads API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
