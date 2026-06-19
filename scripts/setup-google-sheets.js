/**
 * Interactive Google Sheets Setup Script
 * 
 * Usage: node scripts/setup-google-sheets.js <path-to-service-account-key.json>
 * 
 * This script:
 * 1. Reads the Service Account JSON key file
 * 2. Writes it to .env.local as GOOGLE_SERVICE_ACCOUNT_KEY
 * 3. Adds headers to the Google Sheet (Row 1)
 * 4. Adds sample test orders for verification
 * 5. Prints the service account email to share the spreadsheet with
 */

const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1CwgI5hrWLC991B819Q1mXrhltXxr6E-NCZp2E4gGL3I';
const SHEET_NAME = 'Sheet1';

async function main() {
  const keyPath = process.argv[2];

  if (!keyPath) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           🔧 Alser Google Sheets CRM Setup                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Цей скрипт налаштує підключення до Google Sheets.               ║
║                                                                   ║
║  📋 Крок 1: Створіть Service Account                             ║
║     Перейдіть: https://console.cloud.google.com/                 ║
║     → Створіть проєкт (або оберіть існуючий)                    ║
║     → APIs & Services → Library → Google Sheets API → Enable    ║
║     → IAM & Admin → Service Accounts → Create Service Account   ║
║     → Keys → Add Key → Create new key → JSON → Download        ║
║                                                                   ║
║  📋 Крок 2: Поділіться таблицею                                  ║
║     Відкрийте таблицю та натисніть Share                          ║
║     Додайте email сервісного акаунту як Editor                    ║
║     (email знаходиться у JSON-файлі: client_email)              ║
║                                                                   ║
║  📋 Крок 3: Запустіть цей скрипт з шляхом до JSON-ключа:       ║
║     node scripts/setup-google-sheets.js C:\\path\\to\\key.json     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
    process.exit(0);
  }

  // 1. Read the key file
  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Файл не знайдено: ${keyPath}`);
    process.exit(1);
  }

  console.log(`\n🔑 Зчитуємо ключ з: ${keyPath}`);
  const keyContent = fs.readFileSync(keyPath, 'utf8');
  let credentials;
  try {
    credentials = JSON.parse(keyContent);
  } catch (e) {
    console.error('❌ Файл не є валідним JSON');
    process.exit(1);
  }

  console.log(`✅ Service Account Email: ${credentials.client_email}`);
  console.log(`   Project ID: ${credentials.project_id}`);

  // 2. Write to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Single-line JSON for env
  const keyOneLine = JSON.stringify(credentials);

  if (envContent.includes('GOOGLE_SERVICE_ACCOUNT_KEY=')) {
    // Replace existing
    envContent = envContent.replace(
      /GOOGLE_SERVICE_ACCOUNT_KEY=.*/,
      `GOOGLE_SERVICE_ACCOUNT_KEY=${keyOneLine}`
    );
  } else {
    envContent += `\nGOOGLE_SERVICE_ACCOUNT_KEY=${keyOneLine}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Ключ записано у .env.local');

  // 3. Initialize Google Sheets API
  console.log('\n📊 Підключаємося до Google Sheets API...');

  let google;
  try {
    const googleapis = require('googleapis');
    google = googleapis.google;
  } catch (e) {
    console.error('❌ Пакет googleapis не встановлено. Запустіть: npm install googleapis');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // 4. Add headers
  console.log('📝 Додаємо заголовки у рядок 1...');
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'Код',
          'Телефон',
          'Статус',
          'Дата заміру',
          'Дата передплати',
          'Дата виготовлення',
          'Дата доставки/монтажу',
          'Створено',
        ]],
      },
    });
    console.log('✅ Заголовки додано');
  } catch (e) {
    console.error('❌ Помилка додавання заголовків:', e.message);
    console.log('\n⚠️  Переконайтеся, що ви поділилися таблицею з:');
    console.log(`   ${credentials.client_email}`);
    process.exit(1);
  }

  // 5. Add sample test orders
  console.log('📝 Додаємо тестові замовлення...');
  const today = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['AL-4820', '+380671112233', 'Виготовлення', '20.06.2026', '19.06.2026', '', '', '18.06.2026'],
        ['AL-9150', '+380663708808', 'В роботі', '21.06.2026', '', '', '', today],
        ['AL-2840', '+380986588822', 'Виготовлення завершено', '15.06.2026', '16.06.2026', '19.06.2026', '', '15.06.2026'],
      ],
    },
  });
  console.log('✅ Тестові замовлення додано');

  // 6. Format header row (bold + background)
  console.log('🎨 Форматуємо заголовки...');
  try {
    // Get sheet ID
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetId = sheetMeta.data.sheets[0].properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.66, blue: 0.33, alpha: 1 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });
    console.log('✅ Форматування застосовано');
  } catch (e) {
    console.log('⚠️  Форматування пропущено (не критично)');
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           ✅ Налаштування завершено!                              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Таблиця готова до роботи.                                        ║
║  Перезапустіть сервер: npm run dev                                ║
║                                                                   ║
║  Тестові замовлення для перевірки:                                ║
║  • AL-4820 / +380671112233 (Виготовлення)                        ║
║  • AL-9150 / +380663708808 (В роботі)                            ║
║  • AL-2840 / +380986588822 (Виготовлення завершено)              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
  console.error('Помилка:', err);
  process.exit(1);
});
