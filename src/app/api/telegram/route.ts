import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to dynamically read and format knowledge.json
function getKnowledgeBaseContext(): string {
  try {
    const filePath = path.join(process.cwd(), 'src/data/knowledge.json');
    if (!fs.existsSync(filePath)) {
      console.warn('Warning: knowledge.json not found, using empty context');
      return '';
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let context = `ІНФОРМАЦІЯ ПРО КОМПАНІЮ:\n`;
    context += `- Назва: ${data.company_info.name}\n`;
    context += `- Опис: ${data.company_info.description}\n`;
    context += `- Телефон: ${data.company_info.phone}\n`;
    context += `- Email: ${data.company_info.email}\n`;
    context += `- Робочі години: ${data.company_info.working_hours}\n`;
    context += `- Міста обслуговування: ${data.company_info.cities.join(', ')}\n\n`;

    context += `ПРОДУКЦІЯ ТА ЦІНИ:\n`;
    data.products.forEach((p: any) => {
      context += `- ${p.name} (від ${p.price_from} ${p.currency}): ${p.description}\n`;
      context += `  Особливості: ${p.features.join(', ')}\n`;
    });
    context += `\n`;

    context += `ПОСЛУГИ:\n`;
    data.services.forEach((s: any) => {
      context += `- ${s.name}: ${s.description} (Вартість: ${s.price})\n`;
    });
    context += `\n`;

    context += `ЧАСТІ ЗАПИТАННЯ ТА ВІДПОВІДІ (FAQ):\n`;
    data.faqs.forEach((f: any) => {
      context += `Питання: ${f.question}\nВідповідь: ${f.answer}\n\n`;
    });

    return context;
  } catch (error) {
    console.error('Error reading knowledge.json:', error);
    return '';
  }
}

// Helper to send a message back to Telegram
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  try {
    console.log(`[Telegram Webhook] Sending message to ${chatId}: "${text.substring(0, 100)}..."`);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Telegram API error: ${response.status} - ${errText}`);
    } else {
      console.log(`[Telegram Webhook] Message sent successfully to ${chatId}`);
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

// Helper to generate AI response using Gemini, OpenAI, or OpenRouter
async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string> {
  console.log(`[Telegram Webhook] Generating AI response for message: "${userMessage}"`);
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('AI API Key not configured. Please set AI_API_KEY in environment variables.');
  }

  // Check key type
  const isOpenRouter = apiKey.startsWith('sk-or-') || !!process.env.OPENROUTER_API_KEY;
  const isOpenAI = !isOpenRouter && apiKey.startsWith('sk-');

  if (isOpenRouter) {
    // OpenRouter (supports standard OpenAI chat payload)
    const model = process.env.AI_MODEL || 'google/gemini-2.5-flash';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://alser-clone.vercel.app', // Recommended by OpenRouter
        'X-Title': 'Alser Telegram Bot',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else if (isOpenAI) {
    // Standard OpenAI
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else {
    // Default to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// Helper to save lead record locally in .ai-context/leads.json
async function saveLeadLocal(lead: { name: string; username?: string; phone: string; text: string; date: string }) {
  try {
    const dirPath = path.join(process.cwd(), '.ai-context');
    const filePath = path.join(dirPath, 'leads.json');

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let leads = [];
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
    console.log(`[Lead Saved] Saved phone number lead locally: ${lead.phone}`);
  } catch (error) {
    console.error('Failed to write lead locally (ephemeral filesystem?):', error);
  }
}

export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not configured in environment variables.');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const body = await request.json();

    // Check if it's a valid Telegram message
    const message = body.message;
    if (!message || !message.chat || !message.chat.id) {
      return NextResponse.json({ ok: true }); // Return OK so Telegram doesn't retry
    }

    const chatId = message.chat.id;
    const text = message.text ? message.text.trim() : '';
    const from = message.from || {};

    console.log(`[Telegram Webhook] Received message from chat ID: ${chatId} (${from.first_name || ''} @${from.username || ''}): "${text}"`);

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // 1. Handle /start command
    if (text.startsWith('/start')) {
      const startMsg = `Вітаю! Я ваш помічник Alser. ☀️\n\n` +
                       `Я можу відповісти на ваші запитання про наші сонцезахисні системи:\n` +
                       `• Рулонні штори (від 450 грн)\n` +
                       `• Жалюзі (від 350 грн)\n` +
                       `• Римські штори (від 650 грн)\n` +
                       `• Класичні текстильні штори (від 800 грн)\n\n` +
                       `Також ви можете записатися на <b>безкоштовний замір</b> у вас вдома! Наш замірник приїде з каталогами та понад 100 зразками тканин.\n\n` +
                       `Яке запитання вас цікавить? Або просто залиште свій номер телефону, щоб ми зв'язалися з вами!`;
      await sendTelegramMessage(botToken, chatId, startMsg);
      return NextResponse.json({ ok: true });
    }

    // 1.5. Handle order tracking command or direct order code (AL-XXXX)
    const trackMatch = text.match(/^\/track\s+(AL-\d{4})/i) || text.match(/^(AL-\d{4})$/i);
    
    if (trackMatch) {
      const orderCode = trackMatch[1].toUpperCase();
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      // Load orders database
      const ordersPath = path.join(process.cwd(), 'src/data/orders.json');
      let orders = [];
      if (fs.existsSync(ordersPath)) {
        try {
          orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        } catch (err) {
          console.error('Failed to parse orders.json:', err);
        }
      }

      const order = orders.find((o: any) => o.code.toUpperCase() === orderCode);

      if (order) {
        // Status translations
        const statusMap: Record<string, string> = {
          in_progress: '⏳ <b>В роботі</b> (замовлення прийнято, ведеться обробка та підготовка)',
          manufacturing: '🏭 <b>Виготовлення</b> (ваші сонцезахисні системи виготовляються на виробництві)',
          completed: '✅ <b>Виготовлення завершено</b> (виробництво замовлення успішно завершено)',
          delivering: '🚚 <b>Доставляється</b> (замовлення передано службі доставки і прямує до вас)',
        };

        const statusLabel = statusMap[order.status] || order.status;
        const formattedDate = new Date(order.createdAt).toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const replyMsg = `📦 <b>Інформація про замовлення ${order.code}</b>\n\n` +
                         `📅 <b>Дата створення:</b> ${formattedDate}\n` +
                         `ℹ️ <b>Поточний статус:</b> ${statusLabel}\n` +
                         `📞 <b>Телефон клієнта:</b> <code>${order.phone}</code>\n\n` +
                         `Ви можете відстежувати детальний статус замовлень на нашому сайті:\n` +
                         `👉 <a href="${baseUrl}/ua/orders">Кабінет відстеження замовлень Alser</a>`;
        
        await sendTelegramMessage(botToken, chatId, replyMsg);
      } else {
        const errorReply = `❌ Замовлення з кодом <b>${orderCode}</b> не знайдено в нашій базі.\n\n` +
                           `Перевірте правильність коду (наприклад: <code>AL-4820</code>). Також ви можете знайти всі свої замовлення на нашому сайті за номером телефону:\n` +
                           `👉 <a href="${baseUrl}/ua/orders">Кабінет відстеження замовлень Alser</a>`;
        await sendTelegramMessage(botToken, chatId, errorReply);
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Lead Capture: Check if message contains a Ukrainian phone number
    const phoneRegex = /(?:\+?38)?\s?\(?0\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}/g;
    const hasPhone = phoneRegex.test(text);

    if (hasPhone) {
      const matches = text.match(phoneRegex);
      const phoneNumber = matches ? matches[0] : text;

      const lead = {
        name: `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Користувач Telegram',
        username: from.username ? `@${from.username}` : undefined,
        phone: phoneNumber,
        text: text,
        date: new Date().toISOString(),
      };

      // Save lead locally
      await saveLeadLocal(lead);

      // Notify Admin chat if configured
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (adminChatId) {
        const adminMsg = `🚨 <b>Новий лід з Telegram-бота!</b>\n\n` +
                         `👤 <b>Клієнт:</b> ${lead.name}\n` +
                         `🔗 <b>Username:</b> ${lead.username || 'відсутній'}\n` +
                         `📞 <b>Телефон:</b> <code>${lead.phone}</code>\n` +
                         `💬 <b>Повідомлення:</b> ${lead.text}`;
        await sendTelegramMessage(botToken, Number(adminChatId), adminMsg);
      }

      // Respond to user
      const userReply = `Дякуємо! Ваш контактний номер (${phoneNumber}) отримано. Наш менеджер зателефонує вам найближчим часом для узгодження деталей безкоштовного заміру. 📞`;
      await sendTelegramMessage(botToken, chatId, userReply);
      
      return NextResponse.json({ ok: true });
    }

    // 3. Regular consultation: Generate answer via AI LLM
    const kbContext = getKnowledgeBaseContext();
    const systemPrompt = `You are an AI assistant for Alser. Your goal is to answer questions about curtains, blinds, and shutters using only the provided knowledge base. Keep answers short, polite, and in Ukrainian. Always try to guide the user to book a free measurement by sharing their phone number.

KNOWLEDGE BASE:
${kbContext}
`;

    try {
      const aiReply = await generateAIResponse(systemPrompt, text);
      await sendTelegramMessage(botToken, chatId, aiReply);
    } catch (aiError: any) {
      console.error('Error calling AI model:', aiError);
      const fallbackReply = `Дякуємо за ваше повідомлення! Для детальної консультації щодо цін та асортименту, будь ласка, залиште ваш контактний номер телефону або зателефонуйте нам за номером +38 (044) 123-45-67.`;
      await sendTelegramMessage(botToken, chatId, fallbackReply);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Unhandled error in webhook route:', error);
    return NextResponse.json({ ok: true }); // Always return OK to Telegram to avoid retries
  }
}
