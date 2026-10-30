import { NextResponse } from 'next/server';

let custodyData = {
  custodyAmount: 50000,
  expenses: [
    {
      id: '1',
      item: 'شراء وقود للمعدات',
      amount: 1500,
      category: 'تشغيلي',
      date: '2026-10-20',
      notes: 'الموقع الرئيسي'
    }
  ]
};

export async function GET() {
  return NextResponse.json(custodyData);
}

export async function POST(request) {
  const body = await request.json();
  custodyData = body;
  return NextResponse.json({ success: true, data: custodyData });
}
