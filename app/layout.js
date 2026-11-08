import './globals.css';
import { Shell } from '@/components/ui';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'מחזור 2005 בן גוריון',
  description: 'פגישת מחזור באזור אפריל בנס ציונה. עזרו לנו להגיע לכולם.',
  openGraph: { title: 'מחזור 2005 בן גוריון', description: 'ערב מחזור באזור אפריל בנס ציונה. מוצאים את כולם.', locale: 'he_IL' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0F26' };

export default function Root({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Rubik:wght@600;800;900&display=swap" rel="stylesheet" />
      </head>
      <body><Shell>{children}</Shell><Analytics /></body>
    </html>
  );
}
