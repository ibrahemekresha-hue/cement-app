'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CustodyPage() {
  const [custodyData, setCustodyData] = useState({
    custodyAmount: 50000,
    currency: 'LYD',
    expenses: [
      { id: '1', item: 'وقود ومحروقات للآليات والمولدات', amount: 3500, category: 'تشغيلي', date: '2026-10-20', notes: 'تزويد رافعات موقع صب القواعد', receiptImage: null },
      { id: '2', item: 'شراء قطع غيار وخلاطات خرسانة', amount: 8200, category: 'رأسمالي (CWIP)', date: '2026-10-22', notes: 'تجهيزات خط الطواحين', receiptImage: null },
    ]
  });

  const [formData, setFormData] = useState({
    item: '', amount: '', category: 'رأسمالي (CWIP)', notes: '', receiptImage: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  const formatNum = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // جلب بيانات العهدة من الخادم
  const fetchServerData = useCallback(async () => {
    try {
      const res = await fetch('/api/custody');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.expenses)) {
          setCustodyData(data);
        }
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchServerData();
    const interval = setInterval(() => fetchServerData(), 3000);
    return () => clearInterval(interval);
  }, [fetchServerData]);

  // حفظ التعديلات بالسيرفر
  const syncChanges = async (updatedData) => {
    try {
      await fetch('/api/custody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {}
  };

  // معالجة وضغط الصورة المرفقة من الكاميرا أو المعرض تلقائياً
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
        canvas.height = (img.width > MAX_WIDTH) ? img.height * scaleSize : img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, receiptImage: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const totalSpent = custodyData.expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const remainingBalance = custodyData.custodyAmount - totalSpent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) return;

    const newExpense = {
      id: Date.now().toString(),
      item: formData.item,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      receiptImage: formData.receiptImage
    };

    const updated = {
      ...custodyData,
      expenses: [newExpense, ...custodyData.expenses]
    };

    setCustodyData(updated);
    await syncChanges(updated);
    setFormData({ item: '', amount: '', category: 'رأسمالي (CWIP)', notes: '', receiptImage: null });
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      const updated = {
        ...custodyData,
        expenses: custodyData.expenses.filter(e => e.id !== id)
      };
      setCustodyData(updated);
      await syncChanges(updated);
    }
  };

  return (
    <div className="space-y-6 text-right p-6 max-w-7xl mx-auto" dir="rtl">
      {/* نافذة عرض الفاتورة (Modal) عند النقر */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[90vh] flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-3 border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">📸 مستند / فاتورة المصروف</h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>
            <img src={previewImage} alt="الفاتورة المرفقة" className="max-h-[70vh] object-contain rounded-lg border shadow-sm" />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

      {/* رأس الصفحة */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 تسوية وحركة العهدة المالية للمشروع</h2>
          <p className="text-xs text-slate-500 mt-1">مصنع الكوت للأسمنت - المزامنة الحية وإرفاق الفواتير مفعلة</p>
        </div>
        <span className="text-xs font-bold px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
          📡 متصل بالمزامنة الحية
        </span>
      </div>

      {/* بطاقات الإحصائيات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">إجمالي مبلغ العهدة المستلمة</span>
          <span className="text-2xl font-black">{formatNum(custodyData.custodyAmount)} {custodyData.currency}</span>
        </div>
        <div className="bg-rose-950/60 text-rose-200 p-5 rounded-2xl border border-rose-800/40">
          <span className="text-xs text-rose-300 block mb-1">إجمالي المنصرف من العهدة</span>
          <span className="text-2xl font-black text-rose-400">{formatNum(totalSpent)} {custodyData.currency}</span>
        </div>
        <div className="bg-emerald-950/60 text-emerald-200 p-5 rounded-2xl border border-emerald-800/40">
          <span className="text-xs text-emerald-300 block mb-1">المتبقي بالعهدة</span>
          <span className="text-2xl font-black text-emerald-400">{formatNum(remainingBalance)} {custodyData.currency}</span>
        </div>
      </div>

      {/* نموذج تسجيل مصروف جديد مع خيار الكاميرا والمسح الضوئي */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-4">➕ تسجيل مصروف جديد مع إرفاق الفاتورة</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={formData.item}
            onChange={e => setFormData(p => ({ ...p, item: e.target.value }))}
            placeholder="بيان المصروف / البند *"
            className="p-2.5 border rounded-xl text-sm outline-none"
            required
          />
          <input
            type="number"
            value={formData.amount}
            onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
            placeholder="المبلغ (LYD) *"
            className="p-2.5 border rounded-xl text-sm outline-none"
            required
          />
          <select
            value={formData.category}
            onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
            className="p-2.5 border rounded-xl text-sm bg-white outline-none"
          >
            <option value="رأسمالي (CWIP)">رأسمالي (CWIP - أصول قيد التنفيذ)</option>
            <option value="تشغيلي">تشغيلي / مصاريف موقع</option>
          </select>
          <input
            type="text"
            value={formData.notes}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            placeholder="ملاحظات / رقم الفاتورة"
            className="p-2.5 border rounded-xl text-sm outline-none"
          />

          {/* زر التقاط الفاتورة بالكاميرا أو إرفاق ملف */}
          <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-300">
            <label htmlFor="camera-upload" className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5">
              📷 التقاط فاتورة بالكاميرا / رفع صورة
            </label>
            <input
              id="camera-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            {formData.receiptImage ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 font-bold">✓ تم إرفاق الفاتورة</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(formData.receiptImage)}
                  className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 hover:bg-slate-300"
                >
                  معاينة
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, receiptImage: null }))}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  إزالة
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">لم يتم إرفاق فاتورة بعد</span>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end items-center">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
              ➕ إضافة المصروف للعهدة
            </button>
          </div>
        </form>
      </div>

      {/* جدول كشف المصروفات مع زر عرض الفاتورة المرفقة */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b font-bold text-sm text-slate-700">
          كشف بنود المصروفات المسجلة ({custodyData.expenses.length})
        </div>
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="bg-slate-100 text-xs text-slate-600">
              <th className="p-3">التاريخ</th>
              <th className="p-3">بيان المصروف</th>
              <th className="p-3">التصنيف</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الفاتورة / المرفق</th>
              <th className="p-3">ملاحظات</th>
              <th className="p-3 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {custodyData.expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-500 text-xs">{exp.date}</td>
                <td className="p-3 font-semibold text-slate-800">{exp.item || exp.name}</td>
                <td className="p-3 text-xs">
                  <span className={`px-2 py-1 rounded ${exp.category && exp.category.includes('CWIP') ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {exp.category || 'عام'}
                  </span>
                </td>
                <td className="p-3 font-bold text-rose-600">-{formatNum(exp.amount)} LYD</td>
                <td className="p-3">
                  {exp.receiptImage ? (
                    <button
                      onClick={() => setPreviewImage(exp.receiptImage)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      🖼️ عرض الفاتورة
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">بدون مرفق</span>
                  )}
                </td>
                <td className="p-3 text-slate-500 text-xs">{exp.notes || '-'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(exp.id)} className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs hover:bg-rose-100">
                    🗑️ حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}