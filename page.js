'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('custody');
  
  // بيانات العهدة
  const [custodyData, setCustodyData] = useState({ custodyAmount: 50000, expenses: [] });
  const [newExpense, setNewExpense] = useState({ item: '', amount: '', category: 'تشغيلي', notes: '' });

  // بيانات المرتبات
  const [payrollData, setPayrollData] = useState({ employees: [] });
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', type: 'CWIP - أصول قيد التنفيذ', baseSalary: '', allowance: '' });

  const [loading, setLoading] = useState(true);

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resCustody = await fetch('/api/custody');
      const dataCustody = await resCustody.json();
      setCustodyData(dataCustody);

      const resPayroll = await fetch('/api/payroll');
      const dataPayroll = await resPayroll.json();
      setPayrollData(dataPayroll);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // إضافة مصروف عهدة جديد
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.amount) return;

    const updatedExpenses = [
      ...custodyData.expenses,
      {
        id: Date.now().toString(),
        item: newExpense.item,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0],
        notes: newExpense.notes
      }
    ];

    const updated = { ...custodyData, expenses: updatedExpenses };
    setCustodyData(updated);
    setNewExpense({ item: '', amount: '', category: 'تشغيلي', notes: '' });

    await fetch('/api/custody', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  };

  // إضافة موظف/مرتب جديد
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.baseSalary) return;

    const updatedEmployees = [
      ...payrollData.employees,
      {
        id: Date.now().toString(),
        name: newEmployee.name,
        role: newEmployee.role,
        type: newEmployee.type,
        baseSalary: parseFloat(newEmployee.baseSalary),
        allowance: parseFloat(newEmployee.allowance || 0),
        advances: 0,
        deductions: 0,
        status: 'paid',
        currency: 'LYD'
      }
    ];

    const updated = { ...payrollData, employees: updatedEmployees };
    setPayrollData(updated);
    setNewEmployee({ name: '', role: '', type: 'CWIP - أصول قيد التنفيذ', baseSalary: '', allowance: '' });

    await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  };

  const totalSpent = custodyData.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const remainingCustody = (custodyData.custodyAmount || 0) - totalSpent;

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', direction: 'rtl', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🏢 منظومة إدارة العهدة المالية والمرتبات - مصنع الأسمنت</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>نظام سحابي متكامل ومربوط بقاعدة البيانات السحابية Supabase</p>
      </header>

      {/* تبويبات التنقل */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('custody')}
          style={{
            flex: 1, padding: '12px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'custody' ? '#2563eb' : '#e2e8f0', color: activeTab === 'custody' ? 'white' : '#1e293b'
          }}
        >
          💰 تسوية العهدة المالية للمشروع
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            flex: 1, padding: '12px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'payroll' ? '#2563eb' : '#e2e8f0', color: activeTab === 'payroll' ? 'white' : '#1e293b'
          }}
        >
          👥 منظومة المرتبات والسُلف
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#64748b' }}>⏳ جاري تحميل البيانات المزامنة سحابياً...</div>
      ) : activeTab === 'custody' ? (
        /* قسم العهدة */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', borderRight: '5px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>إجمالي العهدة المخصصة</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{custodyData.custodyAmount?.toLocaleString()} د.ل</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', borderRight: '5px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>إجمالي المصروفات</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444', marginTop: '5px' }}>{totalSpent.toLocaleString()} د.ل</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', borderRight: '5px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>المتبقي في العهدة</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>{remainingCustody.toLocaleString()} د.ل</div>
            </div>
          </div>

          {/* نموذج إضافة مصروف */}
          <form onSubmit={handleAddExpense} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>➕ تسجيل مصروف عهدة جديد</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input type="text" placeholder="اسم المصروف / البيان" value={newExpense.item} onChange={(e) => setNewExpense({...newExpense, item: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <input type="number" placeholder="المبلغ (د.ل)" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="تشغيلي">تشغيلي</option>
                <option value="رأسمالي (CWIP)">رأسمالي (CWIP - أصول)</option>
              </select>
              <input type="text" placeholder="ملاحظات" value={newExpense.notes} onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ المصروف</button>
            </div>
          </form>

          {/* جدول المصروفات */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>البيان</th>
                  <th style={{ padding: '12px' }}>التصنيف</th>
                  <th style={{ padding: '12px' }}>المبلغ</th>
                  <th style={{ padding: '12px' }}>التاريخ</th>
                  <th style={{ padding: '12px' }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {custodyData.expenses?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.item}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: item.category.includes('CWIP') ? '#dbeafe' : '#fef3c7', color: item.category.includes('CWIP') ? '#1e40af' : '#92400e' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>{item.amount?.toLocaleString()} د.ل</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{item.date}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* قسم المرتبات */
        <div>
          {/* نموذج إضافة موظف */}
          <form onSubmit={handleAddEmployee} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>➕ إضافة موظف / فني جديد للمشروع</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input type="text" placeholder="اسم الموظف" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <input type="text" placeholder="الوظيفة / الدور" value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <select value={newEmployee.type} onChange={(e) => setNewEmployee({...newEmployee, type: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="CWIP - أصول قيد التنفيذ">CWIP - أصول قيد التنفيذ</option>
                <option value="تشغيلي / لوجستي">تشغيلي / لوجستي</option>
              </select>
              <input type="number" placeholder="المرتب الأساسي (د.ل)" value={newEmployee.baseSalary} onChange={(e) => setNewEmployee({...newEmployee, baseSalary: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <input type="number" placeholder="البدلات (د.ل)" value={newEmployee.allowance} onChange={(e) => setNewEmployee({...newEmployee, allowance: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة الموظف</button>
            </div>
          </form>

          {/* جدول المرتبات */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>الاسم</th>
                  <th style={{ padding: '12px' }}>الوظيفة</th>
                  <th style={{ padding: '12px' }}>نوع التكلفة</th>
                  <th style={{ padding: '12px' }}>المرتب الأساسي</th>
                  <th style={{ padding: '12px' }}>البدلات</th>
                  <th style={{ padding: '12px' }}>الصافي</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.employees?.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{emp.role}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: emp.type.includes('CWIP') ? '#dbeafe' : '#fef3c7', color: emp.type.includes('CWIP') ? '#1e40af' : '#92400e' }}>
                        {emp.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{emp.baseSalary?.toLocaleString()} د.ل</td>
                    <td style={{ padding: '12px', color: '#10b981' }}>+{emp.allowance?.toLocaleString()} د.ل</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{((emp.baseSalary || 0) + (emp.allowance || 0)).toLocaleString()} د.ل</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}