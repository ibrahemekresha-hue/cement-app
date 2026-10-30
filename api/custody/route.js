import { NextResponse } from 'next/server';

const SUPABASE_URL = '[suspicious link removed]';
const SUPABASE_KEY = 'sb_publishable_cqIQbRXw6qnktVR-A7wC1A_XEoqUWp5';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const defaultData = {
  custodyAmount: 50000,
  currency: 'LYD',
  expenses: [
    { id: '1', item: 'وقود ومحروقات للآليات والمولدات', amount: 3500, category: 'تشغيلي', date: '2026-10-20', notes: 'تزويد رافعات موقع صب القواعد', receiptImage: null },
    { id: '2', item: 'شراء قطع غيار وخلاطات خرسانة', amount: 8200, category: 'رأسمالي (CWIP)', date: '2026-10-22', notes: 'تجهيزات خط الطواحين', receiptImage: null },
  ]
};

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}?id=eq.main`, { headers, cache: 'no-store' });
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0 && data[0].data) {
      return NextResponse.json(data[0].data);
    }

    await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'main', data: defaultData }),
    });

    return NextResponse.json(defaultData);
  } catch (err) {
    return NextResponse.json(defaultData);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'main', data: body }),
    });
    return NextResponse.json({ success: true, data: body });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}