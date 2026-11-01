'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPeople, getUser, sendCode, claimPerson, myPerson, onAuth, signOut } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { CLASSES, RSVP } from '@/lib/classes';

export default function Join() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  const [rsvp, setRsvp] = useState('maybe');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const u = await getUser(); setUser(u);
    if (u) { setEmail(u.email); const me = await myPerson(u); setStep(me ? 5 : 3); if (me) setPick(me); }
  };
  useEffect(() => { getPeople().then(setPeople); refresh(); const off = onAuth(refresh); window.addEventListener('focus', refresh); return () => { off(); window.removeEventListener('focus', refresh); }; }, []);

  const pool = useMemo(() => people.filter((p) => !p.claimed_by && (!cls || p.class_no === +cls)), [people, cls]);
  const results = useMemo(() => searchPeople(pool, q), [pool, q]);

  async function send(e) { e.preventDefault(); setBusy(true); setErr('');
    const r = await sendCode(email.trim()); setBusy(false);
    if (r.error) setErr('לא הצלחנו לשלוח. בדקו את כתובת המייל.'); else if (r.demo) refresh(); else setStep(2); }
  async function save(e) { e.preventDefault(); setBusy(true); setErr('');
    const r = await claimPerson(pick, user, { phone, email, rsvp }); setBusy(false);
    if (r.error) setErr('מישהו כבר זיהה את השם הזה. כתבו למארגנים ונסדר.'); else setStep(5); }

  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <div className="steps" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>

      {step === 1 && <form onSubmit={send}>
        <h2>התחברות לפי מייל</h2>
        <p className="sub">נשלח לכם קישור כניסה, בלי סיסמה. אחרי הכניסה תמצאו את השם שלכם ברשימה.</p>
        <label htmlFor="email">אימייל</label>
        <input id="email" type="email" inputMode="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}><button className="btn" disabled={busy}>שלחו לי קישור</button></div>
      </form>}

      {step === 2 && <div>
        <h2>בדקו את המייל</h2>
        <p className="sub">שלחנו קישור כניסה ל-<b dir="ltr">{email}</b>. לחצו עליו (גם בטלפון) ותחזרו לכאן אוטומטית, מחוברים. לא הגיע? בדקו בספאם.</p>
        <div className="row"><button className="btn ghost" onClick={() => setStep(1)}>מייל אחר</button><button className="btn ghost" onClick={send}>שלחו שוב</button></div>
      </div>}

      {step === 3 && <div>
        <h2>מחוברים. עכשיו, מי אתם?</h2>
        <p className="sub">כתבו שם משפחה או שם פרטי, בכל סדר, ובחרו את עצמכם מהרשימה.</p>
        <label htmlFor="cls">כיתה (לא חובה)</label>
        <select id="cls" value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="">כל הכיתות</option>
          {CLASSES.map((c) => <option key={c.no} value={c.no}>יב{c.no}</option>)}
        </select>
        <label htmlFor="q">שם</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="למשל: כהן נועה" autoFocus />
        <div className="list">
          {results.map((p) => <button key={p.id} className="item" onClick={() => { setPick(p); setStep(4); }}>
            <span>{p.name}</span><small>יב{p.class_no}</small></button>)}
          {q && !results.length && <p className="hint">לא מצאנו. נסו שם אחר, או כתבו למארגנים ונוסיף אתכם.</p>}
        </div>
      </div>}

      {step === 4 && pick && <form onSubmit={save}>
        <h2>{pick.name}, יב{pick.class_no}</h2>
        <p className="sub">עוד כמה פרטים ואתם בפנים.</p>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-0000000" />
        <label>האם תגיעו?</label>
        <div className="seg" role="group" aria-label="האם תגיעו">
          {['yes', 'maybe', 'no'].map((k) => <button type="button" key={k} aria-pressed={rsvp === k} onClick={() => setRsvp(k)}>{k === 'yes' ? 'מגיע/ה' : k === 'maybe' ? 'אולי' : 'לא'}</button>)}
        </div>
        <p className="hint">הטלפון והמייל גלויים רק למארגנים.</p>
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>שמרו</button>
          <button type="button" className="btn ghost" onClick={() => setStep(3)}>זה לא אני</button>
        </div>
      </form>}

      {step === 5 && <div>
        <h2>אתם ברשימה{pick ? `, ${pick.name.split(' ').slice(-1)[0]}` : ''}</h2>
        <p className="sub">תודה. עכשיו הכי עוזר: להביא את מי שאתם מכירים מהשכבה.</p>
        <div className="row"><Link href="/invite" className="btn">הביאו חבר מהשכבה</Link><Link href="/" className="btn ghost">לדשבורד</Link><button className="btn ghost" onClick={async () => { await signOut(); location.href = '/'; }}>התנתקות</button></div>
      </div>}
    </section></main>
  );
}
