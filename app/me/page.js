'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { crm, normPhone } from '@/lib/data';
import { useAuth } from '@/components/auth';

export default function Me() {
  const auth = useAuth();
  const [f, setF] = useState({ phone: '', email: '', occupation: '' });
  const [state, setState] = useState('loading'); // loading | ready | saving | saved | error
  const inside = auth.status === 'member' || auth.status === 'admin';

  useEffect(() => {
    if (!inside) return;
    crm('get').then((r) => { if (r.ok) setF({ phone: r.phone || '', email: r.email || '', occupation: r.occupation || '' }); setState('ready'); });
  }, [inside]);

  async function save(e) {
    e.preventDefault(); setState('saving');
    const r = await crm('set', { phone: normPhone(f.phone), email: f.email.trim(), occupation: f.occupation.trim() });
    setState(r.ok ? 'saved' : 'error');
  }
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setState('ready'); };

  if (auth.status === 'loading') return <main><p className="hint">טוען...</p></main>;
  if (!inside) return <main><div className="card"><h2>עדכון פרטים</h2><p className="sub">קודם מוצאים את השם שלכם.</p><Link href="/join" className="btn">מצאו את השם שלכם</Link></div></main>;
  return (
    <main>
      <form className="card" onSubmit={save}>
        <h2>הפרטים שלי</h2>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" dir="ltr" value={f.phone} onChange={set('phone')} />
        <label htmlFor="mail">אימייל</label>
        <input id="mail" type="email" inputMode="email" dir="ltr" value={f.email} onChange={set('email')} />
        <label htmlFor="job">עיסוק</label>
        <input id="job" type="text" value={f.occupation} onChange={set('occupation')} placeholder="למשל: רופאה, מפתח, מורה" />
        <p className="hint">תמיד טוב לדעת אם יש רופא בקהל, או דיג'יי 😉</p>
        <button className="btn" disabled={state === 'saving' || state === 'loading'}>{state === 'saving' ? 'שומר...' : 'שמירה'}</button>
        {state === 'saved' && <p className="hint">נשמר ✓</p>}
        {state === 'error' && <p className="hint">לא הצלחנו לשמור. נסו שוב.</p>}
        <p><Link href="/">חזרה לדשבורד</Link></p>
      </form>
    </main>
  );
}
