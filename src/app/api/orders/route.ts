import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findOrdersInSheet } from '@/lib/google-sheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const code = searchParams.get('code');

    if (!phone || !code) {
      return NextResponse.json({ error: 'Both phone and secret code are required' }, { status: 400 });
    }

    const cleanInput = phone.replace(/[^\d]/g, '');
    if (cleanInput.length < 5) {
      return NextResponse.json({ error: 'Phone number is too short' }, { status: 400 });
    }

    // Primary: Try to fetch from Google Sheets
    let matchedOrders: any[] = [];
    let usedSheets = false;

    try {
      const sheetOrders = await findOrdersInSheet(phone, code);
      if (sheetOrders.length > 0) {
        matchedOrders = sheetOrders;
        usedSheets = true;
        console.log(`[Orders API] Found ${sheetOrders.length} order(s) from Google Sheets for code ${code}`);
      }
    } catch (sheetsError: any) {
      console.warn('[Orders API] Google Sheets fetch failed, falling back to local:', sheetsError?.message);
    }

    // Fallback: If Sheets returned nothing or failed, check local orders.json
    if (!usedSheets || matchedOrders.length === 0) {
      const filePath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(filePath)) {
        try {
          const orders = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          const localMatches = orders.filter((o: any) => {
            const cleanOrderPhone = o.phone.replace(/[^\d]/g, '');
            const phoneMatches = cleanOrderPhone.includes(cleanInput) || cleanInput.includes(cleanOrderPhone);
            const codeMatches = o.code.toUpperCase() === code.trim().toUpperCase();
            return phoneMatches && codeMatches;
          });

          if (localMatches.length > 0 && matchedOrders.length === 0) {
            // Map local orders to the same shape as sheet orders
            matchedOrders = localMatches.map((o: any) => ({
              code: o.code,
              phone: o.phone,
              status: o.status,
              statusText: '',
              dateMeasurement: '',
              datePrepayment: '',
              dateManufacturing: '',
              dateDelivery: '',
              createdAt: o.createdAt || '',
            }));
            console.log(`[Orders API] Found ${localMatches.length} order(s) from local orders.json for code ${code}`);
          }
        } catch (e) {
          console.error('[Orders API] Failed to parse orders.json:', e);
        }
      }
    }

    return NextResponse.json(matchedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
