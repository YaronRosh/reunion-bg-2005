'use client';
import { useEffect, useState } from 'react';

// עמוד עזר חד־פעמי: מרכיב את הסקריפט לגיליון עם הערכים הנכונים. הקוד נלקח מה-# בכתובת ואינו נשלח לשרת.
export default function Sync() {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    (async () => {
      const code = decodeURIComponent(location.hash.slice(1));
      const t = await (await fetch('/sheet-sync.gs')).text();
      setText(t.replace('PUT_URL', process.env.NEXT_PUBLIC_SUPABASE_URL).replace('PUT_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).replace('PUT_ORGANIZER_CODE', code));
    })();
  }, []);
  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>קוד לגיליון</h2>
      <div className="row"><button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(text); setMsg('הועתק. עכשיו מדביקים ב-Apps Script.'); } catch { setMsg('סמנו את הטקסט והעתיקו ידנית.'); } }}>העתיקו</button></div>
      {msg && <p className="hint">{msg}</p>}
      <textarea readOnly dir="ltr" value={text} style={{ minHeight: 260, marginTop: 12, fontSize: 12 }} />
    </section></main>
  );
}
