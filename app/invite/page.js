'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPeople } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { useAuth } from '@/components/auth';

const toIntl = (p) => { const d = (p || '').replace(/\D/g, ''); return d.startsWith('972') ? d : d.startsWith('0') ? '972' + d.slice(1) : d; };
const STATE = { sure: ['בפנים', 'var(--sure)'], maybe: ['צריך לאשר', 'var(--maybe)'], none: ['עוד לא מצאנו', 'var(--none)'] };

export default function Invite() {
  const { status } = useAuth();
  useEffect(() => { if (status === 'anon' || status === 'pending') window.location.replace('/join'); }, [status]);
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  useEffect(() => { getPeople().then((l) => { setPeople(l); const u = new URLSearchParams(location.search); const f = l.find((x) => x.class_no === +u.get('c') && x.name === u.get('n')); if (f) setPick(f); }); }, []);
  const res = useMemo(() => searchPeople(people, q, 12), [people, q]);
  const first = (p) => p.name.split(' ').slice(-1)[0];
  const send = () => {
    const text = `היי ${first(pick)}, אנחנו מארגנים ערב מחזור בן גוריון 2005 באזור אפריל בנס ציונה. כנסו לוודא שאתם ברשימה: ${location.origin}/join`;
    window.open(`https://wa.me/${toIntl(phone)}?text=${encodeURIComponent(text)}`, '_blank');
  };
  if (status !== 'member' && status !== 'admin') return null;
  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>הזמינו חבר מהשכבה</h2>
      <p className="sub">חפשו שם, בחרו אותו, והודעה מוכנה תיפתח לכם בווטסאפ. שום מספר לא נשמר אצלנו. מי שכבר בפנים מסומן בירוק, ואפשר להזמין גם אותו.</p>

      {pick && <div className="picked">
        <div><b>{pick.name}</b><small> · יב{pick.class_no}</small></div>
        <button className="x" aria-label="הסרת הבחירה" onClick={() => { setPick(null); setPhone(''); }}>×</button>
      </div>}

      {!pick ? <>
        <label htmlFor="q">חיפוש שם</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="שם משפחה או שם פרטי" autoFocus />
        <div className="list">{res.map((p) => { const [t, c] = STATE[p.match]; const done = p.match === 'sure';
          return <button key={p.id} className="item" onClick={() => setPick(p)}>
            <span>{p.name}<small style={{ marginInlineStart: 8 }}>יב{p.class_no}</small></span>
            <span className="chip" style={{ color: c, background: 'transparent', border: `1px solid ${c}` }}>{done ? '✓ ' : ''}{t}</span></button>; })}
          {q && !res.length && <p className="hint">אין התאמה. נסו שם אחר.</p>}</div>
      </> : <>
        <label htmlFor="ph">הטלפון של {first(pick)}</label>
        <input id="ph" type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0528449959" autoFocus />
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={toIntl(phone).length < 11} onClick={send}>פתחו הודעה בווטסאפ</button>
          <button className="btn ghost" onClick={() => { setPick(null); setPhone(''); }}>בחרו מישהו אחר</button>
        </div>
      </>}
    </section>
    <div className="row" style={{ marginTop: 16 }}><a className="btn ghost" href="/">← חזרה לדשבורד</a></div>
    </main>
  );
}
