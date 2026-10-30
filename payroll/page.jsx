'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function PayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    type: 'CWIP - أصول قيد التنفيذ',
    baseSalary: '',
    allowance: '',
    advances: '0',
    deductions: '0',
    status: 'pending',
    currency: 'LYD',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const formatNum = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // جلب البيانات من الخادم
  const fetchServerData = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.employees)) setEmployees(data.employees);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchServerData();
    const interval = setInterval(() => fetchServerData(), 3000);
    return () => clearInterval(interval);
  }, [fetchServerData]);

  // حفظ التعديلات بالسيرفر
  const syncChanges = async (updatedEmployees) => {
    try {
      await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees }),
      });
    } catch (err) {}
  };

  // الحسابات المالية الإجمالية
  const totalBase = employees.reduce((acc, curr) => acc + (parseFloat(curr.baseSalary) || 0), 0);
  const totalAllowances = employees.reduce((acc, curr) => acc + (parseFloat(curr.allowance) || 0), 0);
  const totalAdvances = employees.reduce((acc, curr) => acc + (parseFloat(curr.advances) || 0), 0);
  const totalDeductions = employees.reduce((acc, curr) => acc + (parseFloat(curr.deductions) || 0), 0);
  const totalPayroll = totalBase + totalAllowances - (totalAdvances + totalDeductions);

  const totalPaid = employees.filter(e => e.status === 'paid').reduce((acc, curr) => {
    const net = (parseFloat(curr.baseSalary) || 0) + (parseFloat(curr.allowance) || 0) - ((parseFloat(curr.advances) || 0) + (parseFloat(curr.deductions) || 0));
    return acc + net;
  }, 0);

  const totalPending = totalPayroll - totalPaid;
  const cwipPortion = employees.filter(e => e.type && e.type.includes('CWIP')).reduce((acc, curr) => {
    const net = (parseFloat(curr.baseSalary) || 0) + (parseFloat(curr.allowance) || 0) - ((parseFloat(curr.advances) || 0) + (parseFloat(curr.deductions) || 0));
    return acc + net;
  }, 0);

  // دالة تصدير البيانات إلى Excel
  const exportToExcel = () => {
    if (employees.length === 0) {
      alert("لا توجد بيانات مرتبات لتصديرها حالياً!");
      return;
    }

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="[suspicious link removed]">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>كشف المرتبات والسلف</x:Name><x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th { background-color: #1e293b; color: #ffffff; border: 1px solid #0f172a; padding: 10px; font-size: 14px; }
          td { border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-size: 13px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 5px; color: #0f172a; }
          .subtitle { font-size: 12px; text-align: center; color: #64748b; margin-bottom: 15px; }
          .total-row { font-weight: bold; background-color: #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="title">مصنع الكوت للأسمنت - كشف مرتبات ومستحقات وسلف موقع المشروع</div>
        <div class="subtitle">تاريخ التصدير: ${new Date().toLocaleDateString('ar-LY')}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم بالكامل</th>
              <th>الوظيفة / المهمة</th>
              <th>التصنيف المحاسبي</th>
              <th>الراتب الأساسي</th>
              <th>البدلات والإعاشة</th>
              <th>السلف المنصرفة</th>
              <th>الخصومات</th>
              <th>الصافي المستحق</th>
              <th>حالة الصرف</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
    `;

    employees.forEach((emp, index) => {
      const base = parseFloat(emp.baseSalary) || 0;
      const allowance = parseFloat(emp.allowance) || 0;
      const advances = parseFloat(emp.advances) || 0;
      const deductions = parseFloat(emp.deductions) || 0;
      const net = (base + allowance) - (advances + deductions);
      const statusText = emp.status === 'paid' ? 'تم الصرف' : 'معلق';

      tableHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${emp.name}</td>
          <td>${emp.role}</td>
          <td>${emp.type || '-'}</td>
          <td>${base.toFixed(2)}</td>
          <td>${allowance.toFixed(2)}</td>
          <td>${advances.toFixed(2)}</td>
          <td>${deductions.toFixed(2)}</td>
          <td>${net.toFixed(2)} ${emp.currency || 'LYD'}</td>
          <td>${statusText}</td>
          <td>${emp.notes || '-'}</td>
        </tr>
      `;
    });

    tableHTML += `
          <tr class="total-row">
            <td colspan="4" style="text-align: center;">الإجماليات العامة (LYD)</td>
            <td>${totalBase.toFixed(2)}</td>
            <td>${totalAllowances.toFixed(2)}</td>
            <td>${totalAdvances.toFixed(2)}</td>
            <td>${totalDeductions.toFixed(2)}</td>
            <td>${totalPayroll.toFixed(2)} LYD</td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `كشف_المرتبات_والسلف_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.baseSalary) return;

    let updated;
    if (isEditing) {
      updated = employees.map(emp => emp.id === editId ? { ...formData, id: editId } : emp);
      setIsEditing(false);
      setEditId(null);
    } else {
      updated = [{ ...formData, id: Date.now().toString() }, ...employees];
    }

    setEmployees(updated);
    await syncChanges(updated);

    setFormData({
      name: '', role: '', type: 'CWIP - أصول قيد التنفيذ', baseSalary: '', allowance: '', advances: '0', deductions: '0', status: 'pending', currency: 'LYD', notes: ''
    });
  };

  const handleEdit = (emp) => {
    setFormData({
      ...emp,
      advances: emp.advances !== undefined ? emp.advances : '0',
      deductions: emp.deductions !== undefined ? emp.deductions : '0',
    });
    setIsEditing(true);
    setEditId(emp.id);
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      await syncChanges(updated);
    }
  };

  const toggleStatus = async (id) => {
    const updated = employees.map(emp => emp.id === id ? { ...emp, status: emp.status === 'paid' ? 'pending' : 'paid' } : emp);
    setEmployees(updated);
    await syncChanges(updated);
  };

  return (
    <div className="space-y-6 text-right p-6 max-w-7xl mx-auto" dir="rtl">
      {/* رأس الصفحة مع زر التصدير إلى Excel */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">👷 مسير مرتبات وأجور عمالة موقع المشروع</h2>
          <p className="text-xs text-slate-500 mt-1">مصنع الكوت للأسمنت - إدارة الأجور والسلف والمخصومات</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5"
          >
            📊 تصدير كشف المرتبات والسلف (Excel)
          </button>
          <span className="text-xs font-bold px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            📡 متصل بالمزامنة الحية
          </span>
        </div>
      </div>

      {/* بطاقات الإحصائيات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 text-white p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">صافي إجمالي المسير</span>
          <span className="text-xl font-black">{formatNum(totalPayroll)} LYD</span>
        </div>
        <div className="bg-amber-950/60 text-amber-200 p-4 rounded-2xl border border-amber-800/40">
          <span className="text-xs text-amber-300 block mb-1">إجمالي السلف المنصرفة</span>
          <span className="text-xl font-black text-amber-400">{formatNum(totalAdvances)} LYD</span>
        </div>
        <div className="bg-emerald-950/60 text-emerald-200 p-4 rounded-2xl border border-emerald-800/40">
          <span className="text-xs text-emerald-300 block mb-1">المرتبات المدفوعة</span>
          <span className="text-xl font-black text-emerald-400">{formatNum(totalPaid)} LYD</span>
        </div>
        <div className="bg-orange-950/60 text-orange-200 p-4 rounded-2xl border border-orange-800/40">
          <span className="text-xs text-orange-300 block mb-1">المستحقات المعلقة</span>
          <span className="text-xl font-black text-orange-400">{formatNum(totalPending)} LYD</span>
        </div>
        <div className="bg-blue-950/60 text-blue-200 p-4 rounded-2xl border border-blue-800/40">
          <span className="text-xs text-blue-300 block mb-1">أجور رأسمالية (CWIP)</span>
          <span className="text-xl font-black text-blue-400">{formatNum(cwipPortion)} LYD</span>
        </div>
      </div>

      {/* نموذج الإدخال والتعديل */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-4">{isEditing ? '✏️ تعديل بيانات مستحق' : '➕ إضافة مستحق جديد'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="الاسم بالكامل *"
            className="p-2.5 border rounded-xl text-sm outline-none"
            required
          />
          <input
            type="text"
            value={formData.role}
            onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
            placeholder="الوظيفة / المهمة *"
            className="p-2.5 border rounded-xl text-sm outline-none"
            required
          />
          <select
            value={formData.type}
            onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
            className="p-2.5 border rounded-xl text-sm bg-white outline-none"
          >
            <option value="CWIP - أصول قيد التنفيذ">أجور رأسمالية (CWIP)</option>
            <option value="تشغيلي / إداري">أجور تشغيلية / إدارية</option>
          </select>
          <input
            type="number"
            value={formData.baseSalary}
            onChange={e => setFormData(p => ({ ...p, baseSalary: e.target.value }))}
            placeholder="الراتب الأساسي (LYD) *"
            className="p-2.5 border rounded-xl text-sm outline-none"
            required
          />
          <input
            type="number"
            value={formData.allowance}
            onChange={e => setFormData(p => ({ ...p, allowance: e.target.value }))}
            placeholder="البدلات والإعاشة (LYD)"
            className="p-2.5 border rounded-xl text-sm outline-none"
          />
          <input
            type="number"
            value={formData.advances}
            onChange={e => setFormData(p => ({ ...p, advances: e.target.value }))}
            placeholder="السلفيات / السلف (LYD)"
            className="p-2.5 border border-amber-300 rounded-xl text-sm outline-none bg-amber-50/30"
          />
          <input
            type="number"
            value={formData.deductions}
            onChange={e => setFormData(p => ({ ...p, deductions: e.target.value }))}
            placeholder="الخصومات / الاستقطاعات (LYD)"
            className="p-2.5 border rounded-xl text-sm outline-none"
          />
          <select
            value={formData.status}
            onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
            className="p-2.5 border rounded-xl text-sm bg-white outline-none"
          >
            <option value="pending">معلق (قيد الصرف)</option>
            <option value="paid">تم الصرف</option>
          </select>
          <input
            type="text"
            value={formData.notes}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            placeholder="ملاحظات موقع العمل"
            className="md:col-span-3 p-2.5 border rounded-xl text-sm outline-none"
          />
          <div className="md:col-span-1 flex justify-end gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditId(null); }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              {isEditing ? 'حفظ التعديل' : '➕ إضافة للمسير'}
            </button>
          </div>
        </form>
      </div>

      {/* جدول كشف الرواتب والسلف */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b font-bold text-sm text-slate-700">
          كشف الرواتب والمستحقات والسلف ({employees.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600">
                <th className="p-3">الاسم</th>
                <th className="p-3">الوظيفة</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">الأساسي</th>
                <th className="p-3">البدلات</th>
                <th className="p-3">السلف المنصرفة</th>
                <th className="p-3">الخصومات</th>
                <th className="p-3">الصافي المستحق</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-6 text-slate-400">لا يوجد موظفون في المسير حالياً.</td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const base = parseFloat(emp.baseSalary) || 0;
                  const allowance = parseFloat(emp.allowance) || 0;
                  const advances = parseFloat(emp.advances) || 0;
                  const deductions = parseFloat(emp.deductions) || 0;
                  const net = (base + allowance) - (advances + deductions);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {emp.name}
                        {emp.notes && <span className="block text-[11px] text-slate-400 font-normal">{emp.notes}</span>}
                      </td>
                      <td className="p-3 text-slate-600">{emp.role}</td>
                      <td className="p-3 text-xs">
                        <span className={`px-2 py-1 rounded font-medium ${emp.type && emp.type.includes('CWIP') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'}`}>
                          {emp.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{formatNum(base)}</td>
                      <td className="p-3 text-emerald-600">+{formatNum(allowance)}</td>
                      <td className="p-3 font-semibold text-amber-700 bg-amber-50/50">
                        {advances > 0 ? `-${formatNum(advances)}` : '0'}
                      </td>
                      <td className="p-3 text-rose-600">
                        {deductions > 0 ? `-${formatNum(deductions)}` : '0'}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{formatNum(net)} {emp.currency || 'LYD'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleStatus(emp.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                            emp.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {emp.status === 'paid' ? '✓ تم الصرف' : '⏳ معلق'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => handleEdit(emp)} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200">✏️ تعديل</button>
                          <button onClick={() => handleDelete(emp.id)} className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs hover:bg-rose-100">🗑️ حذف</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}