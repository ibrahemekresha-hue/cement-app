import './globals.css';

export const metadata = {
  title: 'منظومة إدارة العهدة المالية والمرتبات - مصنع الأسمنت',
  description: 'نظام إداري ومالي متكامل لمشروع مصنع الأسمنت',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
