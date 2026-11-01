'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPeople } from '@/lib/data';
import { searchPeople } from '@/lib/search';
import { RSVP } from '@/lib/classes';

const toIntl = (p) => { const d = (p || '').replace(/\D/g, ''); return d.startsWith('972') ? d : d.startsWith('0') ? '972' + d.slice(1) : d; };

export default function Invite() {
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [only, setOnly] = useState(true);
  const [pick, setPick] = useState(null);
  const [phone, setPhone] = useState('');
  useEffect(() => { getPeople().then(setPeople); }, []);
  const pool = useMemo(() => people.filter((p) => (only ? p.match !== 'sure' : true)), [people, only]);
  const res = useMemo(() => searchPeople(pool, q), [pool, q]);
  const send = () => {
    const text = `היי ${pick.name.split(' ').slice(-1)[0]}, אנחנו מארגנים ערב מחזור בן גוריון 2005 באזור אפריל בנס ציונה. נכנסים לוודא שאתם ברשימה: ${location.origin}/join`;
    window.open(`https://wa.me/${toIntl(phone)}?text=${encodeURIComponent(text)}`, '_blank');
  };
  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>הביאו חבר מהשכבה</h2>
      <p className="sub">מצאו מישהו שאתם מכירים ועוד לא זוהה, והודעה מוכנה תיפתח לכם בווטסאפ. שום מספר לא נשמר אצלנו.</p>
      <div className="tabs">
        <button className="pill" aria-pressed={only} onClick={() => setOnly(true)}>רק מי שעוד לא זוהה</button>
        <button className="pill" aria-pressed={!only} onClick={() => setOnly(false)}>כולם</button>
      </div>
      {!pick ? <>
        <label htmlFor="q">חיפוש שם</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="שם משפחה או שם פרטי" />
        <div className="list">{res.map((p) => <button key={p.id} className="item" onClick={() => setPick(p)}><span>{p.name}</span><small>יב{p.class_no}</small></button>)}
          {q && !res.length && <p className="hint">אין התאמה. ייתכן שהוא כבר מזוהה.</p>}</div>
      </> : <>
        <h3>{pick.name} · יב{pick.class_no}</h3>
        <label htmlFor="ph">הטלפון שלו</label>
        <input id="ph" type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-0000000" />
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={toIntl(phone).length < 11} onClick={send}>שלחו בווטסאפ</button>
          <button className="btn ghost" onClick={() => { setPick(null); setPhone(''); }}>אחר</button>
        </div>
      </>}
    </section></main>
  );
}
