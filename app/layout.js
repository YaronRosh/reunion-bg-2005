import './globals.css';
import { Shell } from '@/components/ui';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://reunion-bg-2005.vercel.app'),
  title: 'מחזור 2005 בן גוריון',
  description: '20 שנה אחרי, אנחנו נפגשים שוב. ערב מחזור באפריל בנס ציונה. בואו למצוא את השם שלכם ולהזמין חברים מהשכבה.',
  openGraph: {
    title: 'מחזור 2005 בן גוריון נפגשים שוב',
    description: 'ערב מחזור באפריל בנס ציונה. מוצאים את השם שלכם ומזמינים עוד חברים מהשכבה.',
    locale: 'he_IL', type: 'website', url: '/', siteName: 'מחזור 2005 בן גוריון',
  },
  twitter: { card: 'summary', title: 'מחזור 2005 בן גוריון נפגשים שוב', description: 'ערב מחזור באפריל בנס ציונה. בואו למצוא את כולם.' },
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
