'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { crm, normPhone } from '@/lib/data';
import { useAuth } from '@/components/auth';
import { confetti } from '@/lib/confetti';

export default function Me() {
  const auth = useAuth();
  const [f, setF] = useState({ phone: '', email: '', occupation: '', rsvp: 'unknown' });
  const [detail, setDetail] = useState('');
  const [state, setState] = useState('loading'); // loading | ready | saving | saved | error
  const inside = auth.status === 'member' || auth.status === 'admin';

  useEffect(() => {
    if (!inside) return;
    crm('get').then((r) => { if (r.ok) setF({ phone: r.phone || '', email: r.email || '', occupation: r.occupation || '', rsvp: r.rsvp || 'unknown' }); setState('ready'); });
  }, [inside]);

  async function save(e) {
    e.preventDefault(); if (state === 'saving' || state === 'loading') return; setState('saving');
    const r = await crm('set', { phone: normPhone(f.phone), email: f.email.trim(), occupation: f.occupation.trim(), rsvp: f.rsvp });
    setDetail(r.detail || r.error || ''); setState(r.ok ? 'saved' : 'error'); if (r.ok) confetti();
  }
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setState('ready'); };

  if (auth.status === 'loading') return <main><p className="hint">טוען...</p></main>;
  if (!inside) return <main><div className="card"><h2>עדכון פרטים</h2><p className="sub">קודם מוצאים את השם שלכם.</p><Link href="/join" className="btn">מצאו את השם שלכם</Link></div></main>;
  return (
    <main>
      <form className="card" onSubmit={save}>
        <h2>הפרטים שלי</h2>
        <fieldset disabled={state === 'saving' || state === 'loading'} style={{ border: 0, padding: 0, margin: 0 }}>
        <label>מתכוונים להגיע לערב המחזור? (בערך באפריל, בנס ציונה)</label>
        <div className="seg two" role="group" aria-label="האם אתם מתכוונים להגיע">
          {[['yes', 'כן, אני בא/ה'], ['no', 'כנראה שלא']].map(([k, t]) => <button type="button" key={k} aria-pressed={f.rsvp === k} onClick={() => { setF({ ...f, rsvp: f.rsvp === k ? 'unknown' : k }); setState('ready'); }}>{t}</button>)}
        </div>
        <p className="hint">זו רק כוונה ולא התחייבות, ואפשר לשנות בכל רגע.</p>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" dir="ltr" value={f.phone} onChange={set('phone')} />
        <label htmlFor="mail">אימייל</label>
        <input id="mail" type="email" inputMode="email" dir="ltr" value={f.email} onChange={set('email')} />
        <label htmlFor="job">עיסוק (לא חובה)</label>
        <input id="job" type="text" value={f.occupation} onChange={set('occupation')} placeholder="למשל: רופאה, מפתח, מורה" />
        <p className="hint">לא חובה, ואף אחד לא לוחץ 🙂 אבל תמיד טוב לדעת אם יש רופא בקהל, דיג'יי, או מישהו שיסדר לנו הנחה בקייטרינג 😉</p>
        </fieldset>
        <button className="btn" disabled={state === 'saving' || state === 'loading'}>{state === 'saving' ? 'שומרים...' : state === 'loading' ? 'טוענים את הפרטים...' : 'שמירה'}</button>
        {state === 'saved' && <p className="hint">נשמר, תודה! 🎉</p>}
        {state === 'error' && <p className="hint">לא הצלחנו לשמור. נסו שוב.<br /><small dir="ltr">{detail}</small></p>}
        <p><Link href="/">חזרה לדשבורד</Link></p>
      </form>
    </main>
  );
}
