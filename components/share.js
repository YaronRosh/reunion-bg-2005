'use client';
import { useEffect, useState } from 'react';

const text = () => `היי! 20 שנה אחרי, אנחנו נפגשים שוב: ערב מחזור בן גוריון 2005, באפריל בנס ציונה 🎉 בואו למצוא את השם שלכם ולהזמין עוד חברים מהשכבה: ${location.origin}`;

export function ShareButtons() {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && !!navigator.share); }, []);

  async function copy() {
    const t = text();
    try { await navigator.clipboard.writeText(t); }
    catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch {} a.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }
  async function share() {
    try { await navigator.share({ title: 'מחזור 2005 בן גוריון', text: text() }); } catch {}
  }
  return (
    <div>
      <p className="hint">חברים שיש לכם רק בפייסבוק או באינסטגרם, בלי טלפון? העתיקו הודעה והדביקו להם.</p>
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="btn ghost" onClick={copy}>{copied ? 'הועתק ✓' : 'העתיקו הודעה'}</button>
        {canShare && <button type="button" className="btn ghost" onClick={share}>שיתוף</button>}
      </div>
    </div>
  );
}
