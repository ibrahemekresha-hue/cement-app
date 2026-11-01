import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const defaultData = {
      custodyFund: { amount: 50000, currency: 'LYD', recipient: 'أحمد الصالحي', custodyNo: 'CUS-2026-001' },
      invoices: [],
      custodyHistory: []
    };

    if (!kvUrl || !kvToken) {
      return NextResponse.json(defaultData);
    }

    const res = await fetch(`${kvUrl}/get/cement_custody_data`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: 'no-store'
    });

    if (!res.ok) return NextResponse.json(defaultData);

    const data = await res.json();
    let result = null;

    if (data && data.result) {
      try {
        result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      } catch (e) {
        result = null;
      }
    }

    return NextResponse.json(result || defaultData);
  } catch (error) {
    return NextResponse.json({
      custodyFund: { amount: 50000, currency: 'LYD', recipient: 'أحمد الصالحي', custodyNo: 'CUS-2026-001' },
      invoices: [],
      custodyHistory: []
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      await fetch(`${kvUrl}/set/cement_custody_data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(body))
      });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
