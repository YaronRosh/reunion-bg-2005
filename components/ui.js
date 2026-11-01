'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLASSES } from '@/lib/classes';
import { DEMO } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { signOut } from '@/lib/data';
import { useAuth } from '@/components/auth';

export function Shell({ children }) {
  const path = usePathname();
  const { status, user: me, person } = useAuth();
  const admin = status === 'admin';
  const inside = status === 'member' || admin;
  const links = inside ? [['/', 'בית'], ['/invite', 'הזמנת חברים'], ...(admin ? [['/admin', 'מארגנים']] : [])] : [['/', 'בית'], ['/join', 'מצאו אותי']];
  return (
    <div className="wrap">
      <header className="nav">
        <Link href="/" className="brand">בן גוריון <b>2005</b></Link>
        <nav aria-label="ראשי">
          {links.map(([h, t]) => <Link key={h} href={h} aria-current={path === h ? 'page' : undefined}>{t}</Link>)}
        </nav>
      </header>
      <div className="who">{me ? <><span>{person ? <>נרשמתם כ-<b>{person.name}</b> · יב{person.class_no}</> : <>מחובר: <b dir="ltr">{me.email || 'אורח'}</b></>}</span><button onClick={async () => { await signOut(); location.href = '/'; }}>יציאה</button></> : <Link href="/join">עוד לא נרשמתם? מצאו את השם שלכם</Link>}</div>
      {DEMO && <p className="hint" style={{ textAlign: 'center' }}>מצב הדגמה: הנתונים כאן לדוגמה בלבד.</p>}
      {children}
      <footer>מחזור 2005 · בן גוריון · נס ציונה</footer>
    </div>
  );
}

export const COLORS = { sure: 'var(--sure)', maybe: 'var(--maybe)', none: 'var(--none)' };

export function Ring({ t }) {
  const pct = t.total ? Math.round((t.sure / t.total) * 100) : 0;
  const a = t.total ? (t.sure / t.total) * 360 : 0;
  const b = t.total ? a + (t.maybe / t.total) * 360 : 0;
  const bg = `conic-gradient(var(--sure) 0 ${a}deg, var(--maybe) ${a}deg ${b}deg, var(--none) ${b}deg 360deg)`;
  return <div className="ring" style={{ background: bg }} role="img" aria-label={`מצאנו ${pct} אחוז`}><span>{pct}%<small>מצאנו</small></span></div>;
}

export function Stack({ c }) {
  const w = (n) => (c.total ? (n / c.total) * 100 : 0) + '%';
  return <div className="bar"><i style={{ width: w(c.sure), background: COLORS.sure }} /><i style={{ width: w(c.maybe), background: COLORS.maybe }} /><i style={{ width: w(c.none), background: COLORS.none }} /></div>;
}

export function Dashboard({ t, by }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="dash">
        <Ring t={t} />
        <div className="legend">
          <Link href="/list?s=sure" className="leg"><span className="dot" style={{ background: COLORS.sure }} /><b>{t.sure}</b><em>מצאנו</em></Link>
          <Link href="/list?s=maybe" className="leg"><span className="dot" style={{ background: COLORS.maybe }} /><b>{t.maybe}</b><em>צריך לאשר</em></Link>
          <Link href="/list?s=none" className="leg"><span className="dot" style={{ background: COLORS.none }} /><b>{t.none}</b><em>עוד לא מצאנו</em></Link>
        </div>
      </div>
      <div className="classes" style={{ marginTop: 22 }}>
        {CLASSES.map((c) => {
          const s = by[c.no] || { total: 0, sure: 0, maybe: 0, none: 0 };
          return (
            <div className="clsw" key={c.no}>
              <button className="cls" aria-expanded={open === c.no} onClick={() => setOpen(open === c.no ? null : c.no)}>
                <div><strong>יב{c.no}</strong><small>{c.coord}</small></div>
                <Stack c={s} />
                <span className="pct">{s.total ? Math.round((s.sure / s.total) * 100) : 0}%</span>
              </button>
              {open === c.no && <div className="clsd">
                <Link href={`/list?s=sure&c=${c.no}`}><span className="dot" style={{ background: COLORS.sure }} /><b>{s.sure}</b><em>מצאנו</em></Link>
                <Link href={`/list?s=maybe&c=${c.no}`}><span className="dot" style={{ background: COLORS.maybe }} /><b>{s.maybe}</b><em>צריך לאשר</em></Link>
                <Link href={`/list?s=none&c=${c.no}`}><span className="dot" style={{ background: COLORS.none }} /><b>{s.none}</b><em>עוד לא מצאנו</em></Link>
                <small>סה״כ {s.total} בכיתה</small>
              </div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
