'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPeople } from '@/lib/data';
import { CLASSES } from '@/lib/classes';
import { useAuth } from '@/components/auth';

const TABS = [['sure', 'מצאנו'], ['maybe', 'צריך לאשר'], ['none', 'עוד לא מצאנו']];

export default function List() {
  const { status } = useAuth();
  useEffect(() => { if (status === 'anon' || status === 'pending') window.location.replace('/join'); }, [status]);
  const [people, setPeople] = useState([]);
  const [s, setS] = useState('none');
  const [c, setC] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('s')) setS(q.get('s'));
    if (q.get('c')) setC(q.get('c'));
    getPeople().then(setPeople);
  }, []);
  const rows = useMemo(() => people.filter((p) => p.match === s && (!c || p.class_no === +c)), [people, s, c]);
  if (status !== 'member' && status !== 'admin') return null;
  return (
    <main><section className="card" style={{ marginTop: 18 }}>
      <h2>הרשימה</h2>
      <div className="tabs">{TABS.map(([k, t]) => <button key={k} aria-pressed={s === k} onClick={() => setS(k)}>{t}</button>)}</div>
      <select value={c} onChange={(e) => setC(e.target.value)} aria-label="כיתה">
        <option value="">כל הכיתות</option>
        {CLASSES.map((x) => <option key={x.no} value={x.no}>יב{x.no}</option>)}
      </select>
      <p className="hint">{rows.length} שמות</p>
      <div>{rows.map((p) => (
        <div className="lrow" key={p.id}>
          <span>{p.name}<small>יב{p.class_no}</small></span>
          {s !== 'sure' && <Link className="btn" href={`/invite?c=${p.class_no}&n=${encodeURIComponent(p.name)}`}>הזמנה</Link>}
        </div>))}</div>
      <div className="row" style={{ marginTop: 16 }}><Link className="btn ghost" href="/">← חזרה לדשבורד</Link></div>
    </section></main>
  );
}
