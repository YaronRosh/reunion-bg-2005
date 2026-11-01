'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLASSES } from '@/lib/classes';
import { DEMO } from '@/lib/supabase';

export function Shell({ children }) {
  const path = usePathname();
  const links = [['/', 'בית'], ['/join', 'זיהוי'], ['/invite', 'להביא חברים'], ['/admin', 'מארגנים']];
  return (
    <div className="wrap">
      <header className="nav">
        <Link href="/" className="brand">בן גוריון <b>2005</b></Link>
        <nav aria-label="ראשי">
          {links.map(([h, t]) => <Link key={h} href={h} aria-current={path === h ? 'page' : undefined}>{t}</Link>)}
        </nav>
      </header>
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
  return <div className="ring" style={{ background: bg }} role="img" aria-label={`זוהו ${pct} אחוז`}><span>{pct}%<small>זוהו</small></span></div>;
}

export function Stack({ c }) {
  const w = (n) => (c.total ? (n / c.total) * 100 : 0) + '%';
  return <div className="bar"><i style={{ width: w(c.sure), background: COLORS.sure }} /><i style={{ width: w(c.maybe), background: COLORS.maybe }} /><i style={{ width: w(c.none), background: COLORS.none }} /></div>;
}

export function Dashboard({ t, by }) {
  return (
    <>
      <div className="dash">
        <Ring t={t} />
        <div className="legend">
          <div className="leg"><span className="dot" style={{ background: COLORS.sure }} /><b>{t.sure}</b><em>זוהו בביטחון</em></div>
          <div className="leg"><span className="dot" style={{ background: COLORS.maybe }} /><b>{t.maybe}</b><em>לא בטוחים, צריך לאשר</em></div>
          <div className="leg"><span className="dot" style={{ background: COLORS.none }} /><b>{t.none}</b><em>עדיין לא מצאנו</em></div>
        </div>
      </div>
      <div className="classes" style={{ marginTop: 22 }}>
        {CLASSES.map((c) => {
          const s = by[c.no] || { total: 0, sure: 0, maybe: 0, none: 0 };
          return (
            <div className="cls" key={c.no}>
              <div><strong>יב{c.no}</strong><small>{c.coord}</small></div>
              <Stack c={s} />
              <span className="pct">{s.total ? Math.round(((s.sure + s.maybe * 0) / s.total) * 100) : 0}%</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
