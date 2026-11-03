'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPeople, ensureSession, claimPerson, recoverPerson } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { CLASSES } from '@/lib/classes';
import { useAuth, refreshAuth } from '@/components/auth';

export default function Join() {
  const auth = useAuth();
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  const SHOW_RSVP = false; // להחזיר ל-true כשמתקרבים לתאריך
  const [rsvp, setRsvp] = useState('unknown');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [mail, setMail] = useState('');
  const [job, setJob] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { getPeople().then(setPeople); }, []);
  const pool = useMemo(() => people.filter((p) => !cls || p.class_no === +cls), [people, cls]);
  const results = useMemo(() => searchPeople(pool, q), [pool, q]);
  const inside = auth.status === 'member' || auth.status === 'admin';

  async function recover(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await ensureSession();
      if (await recoverPerson(pick, phone, mail)) { setDone(true); refreshAuth(); }
      else setErr('הטלפון לא תואם למה שהושאר. נסו את המספר שהקלדתם בהרשמה, או כתבו למארגנים.');
    } catch { setErr('לא הצלחנו. נסו שוב.'); }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const user = await ensureSession();
      const r = await claimPerson(pick, user, { phone, email: mail.trim(), rsvp, occupation: job.trim() });
      if (r.error) setErr(/already/i.test(r.error) ? 'השם הזה כבר נרשם מהמכשיר של מישהו אחר. אם זה אתם, כתבו למארגנים.' : 'לא הצלחנו לשמור. נסו שוב.'); else { setDone(true); refreshAuth(); }
    } catch { setErr('לא הצלחנו לשמור. נסו שוב.'); }
    setBusy(false);
  }

  if (auth.status === 'loading') return <main><p className="hint">טוען...</p></main>;

  if (done || (inside && !pick)) return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>אתם ברשימה{auth.person ? `, ${auth.person.name.split(' ').slice(-1)[0]}` : pick ? `, ${pick.name.split(' ').slice(-1)[0]}` : ''}</h2>
      <p className="sub">תודה. עכשיו הכי עוזר: להביא את מי שאתם מכירים מהשכבה.</p>
      <div className="row"><Link href="/invite" className="btn">הזמינו חבר מהשכבה</Link><Link href="/" className="btn ghost">לדשבורד</Link></div>
    </section></main>);

  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      {!pick ? <div>
        <h2>מצאו את השם שלכם</h2>
        <p className="sub">כתבו שם משפחה או שם פרטי, בכל סדר, ובחרו את עצמכם מהרשימה. בלי סיסמאות ובלי מיילים.</p>
        <label htmlFor="cls">כיתה (לא חובה)</label>
        <select id="cls" value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="">כל הכיתות</option>
          {CLASSES.map((c) => <option key={c.no} value={c.no}>יב{c.no}</option>)}
        </select>
        <label htmlFor="q">שם</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="למשל: כהן נועה" autoFocus />
        <div className="list">
          {results.map((p) => <button key={p.id} className="item" onClick={() => setPick(p)}>
            <span>{p.name}</span><small>יב{p.class_no}</small></button>)}
          {q && !results.length && <p className="hint">לא מצאנו. נסו שם אחר, או כתבו למארגנים ונוסיף אתכם.</p>}
        </div>
      </div> : pick.claimed_by ? <form onSubmit={recover}>
        <div className="welcome"><span className="wave">👋</span>
          <h2>היי {pick.name.split(' ').reverse().join(' ')}</h2>
          <p className="sub">כבר רשום אצלנו, שמחים שחזרת. כדי להמשיך מכאן, הקלד/י את הטלפון שהשארת בהרשמה.</p></div>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" autoFocus />
        <label htmlFor="mail">אימייל (אם עוד לא השארתם)</label>
        <input id="mail" type="email" inputMode="email" autoComplete="email" dir="ltr" value={mail} onChange={(e) => setMail(e.target.value)} placeholder="name@gmail.com" />
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>המשך</button>
          <button type="button" className="btn ghost" onClick={() => { setPick(null); setErr(''); setPhone(''); }}>זה לא אני</button>
        </div>
      </form> : <form onSubmit={save}>
        <h2>{pick.name}</h2>
        <p className="sub">יב{pick.class_no}. עוד פרט אחד ואתם בפנים. אין צורך להחליט על ההגעה עכשיו.</p>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
        <label htmlFor="mail">אימייל</label>
        <input id="mail" type="email" inputMode="email" autoComplete="email" dir="ltr" required value={mail} onChange={(e) => setMail(e.target.value)} placeholder="name@gmail.com" />
        <p className="hint">כדי שנוכל לעדכן אתכם על הערב. גלוי רק למארגנים.</p>
        <label htmlFor="job">במה אתם עוסקים היום?</label>
        <input id="job" type="text" autoComplete="organization-title" value={job} onChange={(e) => setJob(e.target.value)} placeholder="למשל: רופאה, מפתח, מורה" />
        <p className="hint">תמיד טוב לדעת אם יש רופא בקהל, או דיג'יי 😉</p>
        {SHOW_RSVP && <>
        <label>האם תגיעו?</label>
        <div className="seg" role="group" aria-label="האם תגיעו">
          {['yes', 'maybe', 'no'].map((k) => <button type="button" key={k} aria-pressed={rsvp === k} onClick={() => setRsvp(k)}>{k === 'yes' ? 'מגיע/ה' : k === 'maybe' ? 'אולי' : 'לא'}</button>)}
        </div>
        </>}
        <p className="hint">הטלפון גלוי רק למארגנים.</p>
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>שמרו</button>
          <button type="button" className="btn ghost" onClick={() => { setPick(null); setErr(''); }}>זה לא אני</button>
        </div>
      </form>}

    </section></main>
  );
}
