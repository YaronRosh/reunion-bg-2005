'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPeople, ensureSession, claimPerson, becomeAdmin } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { CLASSES } from '@/lib/classes';
import { useAuth } from '@/components/auth';

export default function Join() {
  const auth = useAuth();
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  const [rsvp, setRsvp] = useState('maybe');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [org, setOrg] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { getPeople().then(setPeople); }, []);
  const pool = useMemo(() => people.filter((p) => !cls || p.class_no === +cls), [people, cls]);
  const results = useMemo(() => searchPeople(pool, q), [pool, q]);
  const inside = auth.status === 'member' || auth.status === 'admin';

  async function save(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const user = await ensureSession();
      const r = await claimPerson(pick, user, { phone, email: '', rsvp });
      if (r.error) setErr(/already/i.test(r.error) ? 'השם הזה כבר נרשם מהמכשיר של מישהו אחר. אם זה אתם, כתבו למארגנים.' : 'לא הצלחנו לשמור. נסו שוב.'); else setDone(true);
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
      </div> : <form onSubmit={save}>
        <h2>{pick.name}</h2>
        <p className="sub">יב{pick.class_no}. עוד פרט אחד ואתם בפנים.</p>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0528449959" />
        <label>האם תגיעו?</label>
        <div className="seg" role="group" aria-label="האם תגיעו">
          {['yes', 'maybe', 'no'].map((k) => <button type="button" key={k} aria-pressed={rsvp === k} onClick={() => setRsvp(k)}>{k === 'yes' ? 'מגיע/ה' : k === 'maybe' ? 'אולי' : 'לא'}</button>)}
        </div>
        <p className="hint">הטלפון גלוי רק למארגנים.</p>
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>שמרו</button>
          <button type="button" className="btn ghost" onClick={() => { setPick(null); setErr(''); }}>זה לא אני</button>
        </div>
      </form>}

      {!pick && <div style={{ marginTop: 26, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        {!org ? <button className="pill" onClick={() => setOrg(true)}>אני מארגן/ת</button> : <>
          <label htmlFor="oc">קוד מארגנים</label>
          <input id="oc" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          <div className="row" style={{ marginTop: 12 }}><button className="btn ghost" onClick={async () => { try { await ensureSession(); const ok = await becomeAdmin(email); if (ok) window.location.href = '/admin'; else setErr('הקוד לא נכון.'); } catch { setErr('לא הצלחנו. נסו שוב.'); } }}>כניסה</button></div>
          {err && <p className="err">{err}</p>}
        </>}
      </div>}
    </section></main>
  );
}
