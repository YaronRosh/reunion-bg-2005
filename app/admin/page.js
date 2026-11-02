'use client';
import { useEffect, useMemo, useState } from 'react';
import { getUser, isAdmin, getPeople, getAnnouncements, postAnnouncement, deleteAnnouncement, importRows, signOut } from '@/lib/data';
import { parseCsv, toPeople } from '@/lib/csv';
import { CLASSES } from '@/lib/classes';
import { DEMO } from '@/lib/supabase';

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [sent, setSent] = useState(false);
  const [ann, setAnn] = useState([]); const [people, setPeople] = useState([]);
  const [f, setF] = useState({ title: '', body: '', pinned: true });
  const [cls, setCls] = useState(0); const [msg, setMsg] = useState('');

  const load = async () => { setAnn(await getAnnouncements()); setPeople(await getPeople()); };
  useEffect(() => { (async () => { const u = await getUser(); setUser(u); if (u) { setOk(await isAdmin(u)); load(); } })(); }, []);

  const missing = useMemo(() => people.filter((p) => p.match !== 'sure' && (!cls || p.class_no === cls)), [people, cls]);

  if (user === undefined) return <p className="hint">טוען...</p>;
  if (!user) { if (typeof window !== 'undefined') window.location.replace('/join'); return null; }
  if (!ok) { if (typeof window !== 'undefined') window.location.replace('/'); return null; }

  return (
    <main>
      <section className="card" style={{ marginTop: 18 }}>
        <h2>סטטוס מערכת</h2>
        <p className="sub">{DEMO ? 'לא מחובר למסד נתונים (מצב הדגמה).' : `מחובר למסד הנתונים. ${people.length} אנשים טעונים.`}</p>
        <div className="row"><button className="btn" onClick={async () => { const rows = await (await fetch('/seed.json')).json(); const res = await importRows(rows); setMsg(res.error ? 'שגיאה: ' + res.error : `נטענו ${rows.length} אנשים`); load(); }}>טענו את כל הרשימה מהגיליון</button></div>
        {msg && <p className="hint">{msg}</p>}
      </section>

      <section className="card">
        <h2>סנכרון לאקסל</h2>
        <p className="sub">הקלידו את קוד המארגנים, העתיקו, והדביקו בגיליון: Extensions → Apps Script. אחר כך הריצו sync פעם אחת, והגדירו Trigger כל 10 דקות. ההרשמות, הטלפונים והמיילים יופיעו בלשוניות הכיתות (טלפון בעמודה E, אימייל בעמודה H).</p>
        <input dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} placeholder="קוד מארגנים" autoComplete="off" />
        <div className="row" style={{ marginTop: 12 }}><button className="btn" disabled={!code} onClick={async () => {
          const t = await (await fetch('/sheet-sync.gs')).text();
          const out = t.replace('PUT_URL', process.env.NEXT_PUBLIC_SUPABASE_URL).replace('PUT_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).replace('PUT_ORGANIZER_CODE', code.trim());
          try { await navigator.clipboard.writeText(out); setMsg('הקוד הועתק. הדביקו אותו ב-Apps Script.'); } catch { setMsg('לא הצלחנו להעתיק'); }
        }}>העתיקו קוד לגיליון</button></div>
        {msg && <p className="hint">{msg}</p>}
      </section>

      <section className="card">
        <h2>הודעה חדשה</h2>
        <label htmlFor="t">כותרת</label><input id="t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <label htmlFor="b">תוכן</label><textarea id="b" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" style={{ width: 22, minHeight: 22 }} checked={f.pinned} onChange={(e) => setF({ ...f, pinned: e.target.checked })} />להצמיד בראש האתר</label>
        <div className="row" style={{ marginTop: 14 }}><button className="btn" disabled={!f.title || !f.body} onClick={async () => { await postAnnouncement(f); setF({ title: '', body: '', pinned: true }); load(); }}>פרסמו</button></div>
        <div className="list" style={{ marginTop: 18 }}>{ann.map((a) => <div className="item" key={a.id}><span>{a.title}</span><button className="pill" onClick={async () => { await deleteAnnouncement(a.id); load(); }}>מחיקה</button></div>)}</div>
      </section>

      <section className="card">
        <h2>מי עוד חסר</h2>
        <p className="sub">{missing.length} אנשים שלא זוהו בביטחון.</p>
        <div className="tabs"><button className="pill" aria-pressed={!cls} onClick={() => setCls(0)}>הכול</button>
          {CLASSES.map((c) => <button key={c.no} className="pill" aria-pressed={cls === c.no} onClick={() => setCls(c.no)}>יב{c.no}</button>)}</div>
        <div className="list">{missing.slice(0, 80).map((p) => <div className="item" key={p.id}><span>{p.name}</span><small>יב{p.class_no} · {p.match === 'maybe' ? 'לא בטוח' : 'לא זוהה'}</small></div>)}</div>
      </section>

      <section className="card">
        <h2>ייבוא מהגיליון</h2>
        <p className="sub">ייצאו את לשונית "כולם" כ-CSV והעלו כאן. שמות וכיתות בלבד נשמרים.</p>
        <input type="file" accept=".csv" onChange={async (e) => { const t = await e.target.files[0].text(); const r = toPeople(parseCsv(t)); const res = await importRows(r); setMsg(res.error || `יובאו ${r.length} אנשים`); load(); }} />
        {msg && <p className="hint">{msg}</p>}
        <div className="row" style={{ marginTop: 14 }}><button className="btn ghost" onClick={async () => { await signOut(); location.reload(); }}>יציאה</button></div>
      </section>
    </main>
  );
}
