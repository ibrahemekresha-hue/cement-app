import { NextResponse } from 'next/server';

let payrollData = {
  employees: [
    {
      id: '1',
      name: 'أحمد الصالحي',
      role: 'مهندس موقع',
      type: 'CWIP - أصول قيد التنفيذ',
      baseSalary: 4500,
      allowance: 500,
      advances: 0,
      deductions: 0,
      status: 'paid',
      currency: 'LYD'
    }
  ]
};

export async function GET() {
  return NextResponse.json(payrollData);
}

export async function POST(request) {
  const body = await request.json();
  payrollData = body;
  return NextResponse.json({ success: true, data: payrollData });
}
