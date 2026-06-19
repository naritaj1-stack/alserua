const fs = require('fs');
const path = require('path');
const http = require('https');

// Load env variables manually from .env.local if present
const env = {};
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const index = trimmed.indexOf('=');
        const key = trimmed.substring(0, index).trim();
        const value = trimmed
          .substring(index + 1)
          .trim()
          .replace(/^['"]|['"]$/g, ''); // Remove wrapping quotes if any
        env[key] = value;
      }
    });
  }
} catch (err) {
  console.warn('Warning: Could not parse .env.local file.', err.message);
}

const token = process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
const domain = process.argv[2] || process.env.VERCEL_URL || env.VERCEL_URL || env.DOMAIN;

console.log('--- Telegram Webhook Setup ---');

if (!token) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in process.env or .env.local');
  console.log('Please add it to .env.local as: TELEGRAM_BOT_TOKEN=your_token_here');
  process.exit(1);
}

if (!domain) {
  console.error('❌ Error: Domain or host is not specified.');
  console.log('\nUsage:');
  console.log('  node scripts/set-webhook.js <your-domain-or-ngrok-url>');
  console.log('\nExample:');
  console.log('  node scripts/set-webhook.js https://my-app.ngrok-free.app');
  process.exit(1);
}

const cleanDomain = domain.startsWith('http') ? domain : `https://${domain}`;
const webhookUrl = `${cleanDomain}/api/telegram`;
const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

console.log(`Setting Webhook URL to: ${webhookUrl}`);
console.log('Sending request to Telegram API...');

http.get(telegramUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.ok) {
        console.log('\n✅ SUCCESS: Webhook registered successfully!');
        console.log('Telegram Response:', response);
      } else {
        console.error('\n❌ ERROR: Webhook registration failed.');
        console.error('Telegram Response:', response.description || response);
      }
    } catch (e) {
      console.error('\n❌ ERROR: Failed to parse Telegram response.');
      console.error('Raw Response:', data);
    }
  });
}).on('error', (err) => {
  console.error('\n❌ Request error:', err.message);
});
