'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPeople, ensureSession, claimPerson, recoverPerson, crm } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { CLASSES } from '@/lib/classes';
import { useAuth, refreshAuth } from '@/components/auth';
import { confetti } from '@/lib/confetti';

export default function Join() {
  const auth = useAuth();
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  const SHOW_RSVP = true;
  const [rsvp, setRsvp] = useState('unknown');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [mail, setMail] = useState('');
  const [job, setJob] = useState('');
  const [sent, setSent] = useState(false);
  const [follow, setFollow] = useState(null); // שאלות שחסרות אחרי חזרה לחשבון

  useEffect(() => { getPeople().then(setPeople); }, []);
  const pool = useMemo(() => people.filter((p) => !cls || p.class_no === +cls), [people, cls]);
  const results = useMemo(() => searchPeople(pool, q), [pool, q]);
  const inside = auth.status === 'member' || auth.status === 'admin';

  async function recover(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setErr('');
    try {
      await ensureSession();
      if (await recoverPerson(pick, phone, '')) {
        refreshAuth();
        const c = await crm('get');
        const need = { email: c.ok && !c.email, rsvp: c.ok && (!c.rsvp || c.rsvp === 'unknown') };
        if (need.email || need.rsvp) { setFollow({ ...need, job: !c.occupation }); setMail(''); setRsvp('unknown'); }
        else setDone(true);
      }
      else setErr('הטלפון לא תואם למה שהשארתם בהרשמה. נסו את המספר שהקלדתם אז, או כתבו למארגנים.');
    } catch { setErr('לא הצלחנו. נסו שוב.'); }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setErr('');
    try {
      const user = await ensureSession();
      const r = await claimPerson(pick, user, { phone, email: mail.trim(), rsvp, occupation: job.trim() });
      if (r.error) setErr(/already/i.test(r.error) ? 'השם הזה כבר נרשם ממכשיר אחר. אם זה אתם, בחרו אותו שוב והקלידו את הטלפון שהשארתם, או כתבו למארגנים.' : 'לא הצלחנו לשמור. נסו שוב.'); else { setDone(true); refreshAuth(); confetti(); }
    } catch { setErr('לא הצלחנו לשמור. נסו שוב.'); }
    setBusy(false);
  }

  async function saveFollow(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setErr('');
    const f = {};
    if (follow.email && mail.trim()) f.email = mail.trim();
    if (follow.rsvp && rsvp !== 'unknown') f.rsvp = rsvp;
    if (follow.job && job.trim()) f.occupation = job.trim();
    const res = Object.keys(f).length ? await crm('set', f) : { ok: true };
    setBusy(false);
    if (!res.ok) { setErr('לא הצלחנו לשמור. נסו שוב.'); return; }
    setFollow(null); setDone(true); if (Object.keys(f).length) confetti();
  }

  if (auth.status === 'loading') return <main><p className="hint">טוען...</p></main>;

  if (follow) return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <form onSubmit={saveFollow}><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <h2>שמחים שחזרתם, {pick.name.split(' ').slice(-1)[0]} 👋</h2>
        <p className="sub">נשארו לנו רק כמה דברים קטנים, ואפשר גם לדלג.</p>
        {follow.email && <><label htmlFor="fmail">אימייל</label>
        <input id="fmail" type="email" inputMode="email" autoComplete="email" dir="ltr" value={mail} onChange={(e) => setMail(e.target.value)} placeholder="name@gmail.com" />
        <p className="hint">כדי שנוכל לעדכן אתכם על הערב. גלוי רק למארגנים.</p></>}
        {follow.rsvp && <>
        <label>מתכוונים להגיע לערב המחזור? (בערך באפריל, בנס ציונה)</label>
        <div className="seg two" role="group" aria-label="האם אתם מתכוונים להגיע">
          {[['yes', 'כן, אני בא/ה'], ['no', 'כנראה שלא']].map(([k, t]) => <button type="button" key={k} aria-pressed={rsvp === k} onClick={() => setRsvp(rsvp === k ? 'unknown' : k)}>{t}</button>)}
        </div>
        <p className="hint">זו רק כוונה ולא התחייבות. אפשר לשנות בכל רגע ב"הפרטים שלי".</p></>}
        {follow.job && <><label htmlFor="fjob">במה אתם עוסקים היום? (לא חובה)</label>
        <input id="fjob" type="text" value={job} onChange={(e) => setJob(e.target.value)} placeholder="למשל: רופאה, מפתח, מורה" />
        <p className="hint">לא חובה, ואף אחד לא לוחץ 🙂 אבל תמיד טוב לדעת אם יש רופא בקהל, דיג'יי, או מישהו שיסדר לנו הנחה בקייטרינג 😉</p></>}
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>{busy ? 'שומרים...' : 'שמרו'}</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => { setFollow(null); setDone(true); }}>דלגו</button>
        </div>
      </fieldset></form>
    </section></main>);

  if (done || (inside && !pick)) return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>🎉 אתם ברשימה{auth.person ? `, ${auth.person.name.split(' ').slice(-1)[0]}` : pick ? `, ${pick.name.split(' ').slice(-1)[0]}` : ''}</h2>
      <p className="sub">תודה! עכשיו הכי עוזר להביא את מי שאתם מכירים מהשכבה.</p>
      <div className="row"><Link href="/invite" className="btn">הזמינו חבר מהשכבה</Link><Link href="/" className="btn ghost">לדשבורד</Link></div>
    </section></main>);

  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      {!pick ? <div>
        <h2>מצאו את השם שלכם</h2>
        <p className="sub">כתבו שם משפחה או שם פרטי, בכל סדר, ובחרו את עצמכם מהרשימה. בלי סיסמאות.</p>
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
      </div> : pick.claimed_by ? <form onSubmit={recover}><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="welcome"><span className="wave">👋</span>
          <h2>היי {pick.name.split(' ').reverse().join(' ')}</h2>
          <p className="sub">כבר רשומים אצלנו, שמחים שחזרתם. כדי להמשיך מכאן, הקלידו את הטלפון שהשארתם בהרשמה. זה רק כדי לוודא שזה אתם.</p></div>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" autoFocus />
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>{busy ? 'בודקים...' : 'המשך'}</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => { setPick(null); setErr(''); setPhone(''); }}>זה לא אני</button>
        </div>
      </fieldset></form> : <form onSubmit={save}><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <h2>{pick.name}</h2>
        <p className="sub">יב{pick.class_no}. עוד כמה פרטים קטנים ואתם בפנים. אין צורך להחליט על ההגעה עכשיו.</p>
        <label htmlFor="phone">טלפון</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
        <label htmlFor="mail">אימייל</label>
        <input id="mail" type="email" inputMode="email" autoComplete="email" dir="ltr" required value={mail} onChange={(e) => setMail(e.target.value)} placeholder="name@gmail.com" />
        <p className="hint">כדי שנוכל לעדכן אתכם על הערב. הטלפון והאימייל גלויים רק למארגנים.</p>
        {SHOW_RSVP && <>
        <label>מתכוונים להגיע לערב המחזור? (בערך באפריל, בנס ציונה)</label>
        <div className="seg two" role="group" aria-label="האם אתם מתכוונים להגיע">
          {[['yes', 'כן, אני בא/ה'], ['no', 'כנראה שלא']].map(([k, t]) => <button type="button" key={k} aria-pressed={rsvp === k} onClick={() => setRsvp(rsvp === k ? 'unknown' : k)}>{t}</button>)}
        </div>
        <p className="hint">זו רק כוונה ולא התחייבות. אפשר לשנות בכל רגע ב"הפרטים שלי".</p>
        </>}
        <label htmlFor="job">במה אתם עוסקים היום? (לא חובה)</label>
        <input id="job" type="text" autoComplete="organization-title" value={job} onChange={(e) => setJob(e.target.value)} placeholder="למשל: רופאה, מפתח, מורה" />
        <p className="hint">לא חובה, ואף אחד לא לוחץ 🙂 אבל תמיד טוב לדעת אם יש רופא בקהל, דיג'יי, או מישהו שיסדר לנו הנחה בקייטרינג 😉</p>
        {err && <p className="err">{err}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>{busy ? 'שומרים...' : 'שמרו'}</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => { setPick(null); setErr(''); }}>זה לא אני</button>
        </div>
      </fieldset></form>}

    </section></main>
  );
}
