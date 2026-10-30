import './globals.css';

export const metadata = {
  title: 'منظومة مصنع الكوت للأسمنت',
  description: 'نظام إدارة العهد المالية والمشاريع',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}