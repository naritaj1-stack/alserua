/**
 * Google Sheets integration for Alser CRM.
 * 
 * READ: Uses the public Google Visualization API (no auth needed if sheet is public).
 * WRITE: Uses Google Sheets API with Service Account (optional, graceful fallback).
 * 
 * The sheet must be shared as "Anyone with the link can view" for reading.
 * For writing, set GOOGLE_SERVICE_ACCOUNT_KEY in .env.local.
 */

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1CwgI5hrWLC991B819Q1mXrhltXxr6E-NCZp2E4gGL3I';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

// ─── Status mapping: Sheet Ukrainian text ↔ internal keys ───
const STATUS_TEXT_TO_KEY: Record<string, string> = {
  'Чекає передплати': 'in_progress',
  'В роботі': 'in_progress',
  'Виготовлення': 'manufacturing',
  'Виготовлення завершено': 'completed',
  'Доставляється': 'delivering',
};

// ────────────────────────────────────────────────────────────────────
// PUBLIC READ — via Google Visualization API (no auth required)
// ────────────────────────────────────────────────────────────────────

interface SheetRow {
  code: string;       // A
  phone: string;      // B
  statusText: string; // C
  dateMeasurement: string;  // D
  datePrepayment: string;   // E
  dateManufacturing: string;// F
  dateDelivery: string;     // G
  createdAt: string;        // H
}

/**
 * Fetch all rows from the public Google Sheet using the Visualization API.
 * Returns parsed rows (skipping header).
 */
async function fetchAllRowsPublic(): Promise<SheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const text = await response.text();
  // Response is wrapped in google.visualization.Query.setResponse({...})
  const jsonStr = text.replace(/^\/\*O_o\*\/\n?google\.visualization\.Query\.setResponse\(/, '').replace(/\);?\s*$/, '');
  const data = JSON.parse(jsonStr);

  const rows: SheetRow[] = [];
  const tableRows = data?.table?.rows || [];

  for (const row of tableRows) {
    const cells = row.c || [];
    const getValue = (idx: number): string => {
      const cell = cells[idx];
      if (!cell) return '';
      // Prefer formatted value (f) for dates, fall back to value (v)
      return (cell.f || cell.v || '').toString().trim();
    };

    const code = getValue(0);
    if (!code) continue; // Skip empty rows

    rows.push({
      code,
      phone: getValue(1),
      statusText: getValue(2),
      dateMeasurement: getValue(3),
      datePrepayment: getValue(4),
      dateManufacturing: getValue(5),
      dateDelivery: getValue(6),
      createdAt: getValue(7),
    });
  }

  return rows;
}

export interface SheetOrder {
  code: string;
  phone: string;
  status: string;        // internal key
  statusText: string;    // original text from sheet
  dateMeasurement: string;
  datePrepayment: string;
  dateManufacturing: string;
  dateDelivery: string;
  createdAt: string;
}

/**
 * Find orders matching phone + code from the public Google Sheet.
 */
export async function findOrdersInSheet(phone: string, code: string): Promise<SheetOrder[]> {
  try {
    const allRows = await fetchAllRowsPublic();
    console.log(`[Google Sheets] Fetched ${allRows.length} rows from public sheet`);

    const cleanInput = phone.replace(/[^\d]/g, '');
    if (cleanInput.length < 5) return [];

    const matched: SheetOrder[] = [];

    for (const row of allRows) {
      const codeMatches = row.code.toUpperCase() === code.trim().toUpperCase();
      const cleanRowPhone = row.phone.replace(/[^\d]/g, '');
      const phoneMatches = cleanRowPhone.includes(cleanInput) || cleanInput.includes(cleanRowPhone);

      if (codeMatches && phoneMatches) {
        matched.push({
          code: row.code,
          phone: row.phone,
          status: STATUS_TEXT_TO_KEY[row.statusText] || 'in_progress',
          statusText: row.statusText,
          dateMeasurement: row.dateMeasurement,
          datePrepayment: row.datePrepayment,
          dateManufacturing: row.dateManufacturing,
          dateDelivery: row.dateDelivery,
          createdAt: row.createdAt,
        });
      }
    }

    return matched;
  } catch (error: any) {
    console.error('[Google Sheets] Error reading public sheet:', error?.message || error);
    return [];
  }
}

/**
 * Get all existing order codes from the public sheet (for uniqueness check).
 */
export async function getExistingCodes(): Promise<string[]> {
  try {
    const allRows = await fetchAllRowsPublic();
    return allRows.map((r) => r.code).filter((c) => c.length > 0);
  } catch (error: any) {
    console.error('[Google Sheets] Error fetching codes:', error?.message || error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────
// WRITE — via Google Sheets API with Service Account (optional)
// ────────────────────────────────────────────────────────────────────

/**
 * Append a new order row to the Google Sheet.
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY in env.
 * If not configured, logs a warning and returns silently.
 */
export async function appendOrderToSheet(order: {
  code: string;
  phone: string;
  createdAt: string;
}): Promise<boolean> {
  const keyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyEnv) {
    console.warn('[Google Sheets] GOOGLE_SERVICE_ACCOUNT_KEY not set — skipping sheet write. Order saved locally only.');
    return false;
  }

  try {
    // Dynamic import to avoid loading googleapis if not needed
    const { google } = await import('googleapis');

    let credentials: any;
    try {
      credentials = JSON.parse(keyEnv);
    } catch (e) {
      console.error('[Google Sheets] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON');
      return false;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const createdDate = new Date(order.createdAt).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const values = [
      [
        order.code,          // A: Code
        order.phone,         // B: Phone
        'Чекає передплати',  // C: Status (default)
        '',                  // D: Date of Measurement
        '',                  // E: Date of Prepayment
        '',                  // F: Date of Manufacturing
        '',                  // G: Date of Delivery
        createdDate,         // H: Created At
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`[Google Sheets] ✅ Appended order ${order.code} for ${order.phone}`);
    return true;
  } catch (error: any) {
    console.error('[Google Sheets] Error appending order:', error?.message || error);
    return false;
  }
}
