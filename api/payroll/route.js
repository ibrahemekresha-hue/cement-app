import { NextResponse } from 'next/server';

const SUPABASE_URL = '[suspicious link removed]';
const SUPABASE_KEY = 'sb_publishable_cqIQbRXw6qnktVR-A7wC1A_XEoqUWp5';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const defaultEmployees = [
  { id: '1', name: 'جون الصيني', role: 'خبير تركيبات ميكانيكية', type: 'CWIP - أصول قيد التنفيذ', baseSalary: 15000, allowance: 3000, advances: 0, deductions: 0, status: 'paid', currency: 'LYD', notes: 'إعاشة وبدلات موقع تركيب الطواحين' },
  { id: '2', name: 'عمر المهدوي', role: 'مشرف الأعمال المدنية', type: 'CWIP - أصول قيد التنفيذ', baseSalary: 4500, allowance: 500, advances: 0, deductions: 200, status: 'paid', currency: 'LYD', notes: 'إشراف على صب خرسانات السور والقواعد' },
  { id: '3', name: 'سالم الورفلي', role: 'فني كهرباء وتحكم آلي', type: 'CWIP - أصول قيد التنفيذ', baseSalary: 3800, allowance: 400, advances: 0, deductions: 0, status: 'pending', currency: 'LYD', notes: 'تمديدات لوحات التوزيع' },
  { id: '4', name: 'رمضان بوعجيلة', role: 'سائق رافعة وشاحنة', type: 'تشغيلي / لوجستي', baseSalary: 2800, allowance: 300, advances: 0, deductions: 150, status: 'paid', currency: 'LYD', notes: 'نقل مواد وتفريغ الكلنكر' },
];

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}?id=eq.main`, { headers, cache: 'no-store' });
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0 && data[0].data) {
      return NextResponse.json(data[0].data);
    }

    const initialData = { employees: defaultEmployees };
    await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'main', data: initialData }),
    });

    return NextResponse.json(initialData);
  } catch (err) {
    return NextResponse.json({ employees: defaultEmployees });
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