'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPeople, getAnnouncements, stats, setRsvp } from '@/lib/data';
import { Dashboard } from '@/components/ui';
import { useAuth } from '@/components/auth';

export default function Home() {
  const { status, person } = useAuth();
  const [mine, setMine] = useState(null);
  useEffect(() => { if (person) setMine(person.rsvp); }, [person]);
  const inside = status === 'member' || status === 'admin';
  const [people, setPeople] = useState(null);
  const [ann, setAnn] = useState([]);
  useEffect(() => { if (inside) { getPeople().then(setPeople); getAnnouncements().then(setAnn); } }, [inside]);
  const { t, by } = stats(people || []);
  const share = () => {
    const text = 'מחזור 2005 בן גוריון: ערב מחזור באזור אפריל בנס ציונה. בואו לוודא שאתם ברשימה ועזרו לנו להגיע לכולם: ' + location.origin;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const leave = (e) => { e.currentTarget.style.setProperty('--mx', 0); e.currentTarget.style.setProperty('--my', 0); };
  return (
    <main>
      <section className="hero">
        <div className="stage" aria-hidden="true" onPointerMove={move} onPointerLeave={leave}>
          <i className="b b1" /><i className="b b2" /><i className="b b3" /><i className="b b4" /><i className="b b5" /><i className="b b6" />
          <p className="year">2005</p>
        </div>
        <p className="kicker">מחזור 2005 · בן גוריון · נס ציונה</p>
        <h1>נפגשים באפריל.<br />כולם.</h1>
        <p className="lede">ערב אחד עם האנשים שישבו איתכם בכיתה. מוזיקה, כוסית, נוסטלגיה, ותמונת המחזור על המסך. התאריך והאולם נסגרים בקרוב.</p>
        <div className="row">
          {inside ? <Link href="/invite" className="btn">הזמינו חבר מהשכבה</Link> : <Link href="/join" className="btn">{status === 'pending' ? 'בחרו את השם שלכם' : 'מצאו את השם שלכם'}</Link>}
        </div>
        <ul className="facts"><li><b>10</b>כיתות</li><li><b>{people ? t.total : '339'}</b>חברים ברשימה</li><li><b>1</b>ערב</li></ul>
      </section>

      {inside && ann.map((a) => (
        <section key={a.id}><div className="card ann">
          {a.pinned && <span className="pin">הודעה מהמארגנים</span>}
          <h3>{a.title}</h3><p>{a.body}</p>
        </div></section>
      ))}

      {!inside && status !== 'loading' && <section><div className="card"><h2>האתר פתוח לבוגרי המחזור</h2><p className="sub">כדי לראות מי כבר כאן, מי עוד חסר ומה קורה בערב, מוצאים את השם שלכם ברשימה ומשאירים טלפון. זה לוקח חצי דקה.</p><Link href="/join" className="btn">מצאו את השם שלכם</Link></div></section>}

      {inside && person && <section><div className="card">
        <h2>ההגעה שלי</h2>
        <div className="seg" role="group" aria-label="ההגעה שלי">
          {[['yes', 'מגיע/ה'], ['maybe', 'אולי'], ['no', 'לא']].map(([k, t]) => <button key={k} aria-pressed={mine === k} onClick={async () => { setMine(k); await setRsvp(person, k); }}>{t}</button>)}
        </div>
      </div></section>}

      {inside && <section>
        <div className="card">
          <h2>מי כבר כאן, ומי עוד חסר</h2>
          <p className="sub">{people ? `${t.total} אנשים בעשר כיתות, ${t.sure} כבר מצאנו. כל שם שתמצאו הוא עוד אחד שיגיע.` : 'טוען...'}</p>
          {people && <Dashboard t={t} by={by} />}
          <div className="row" style={{ marginTop: 20 }}>
            <button className="btn" onClick={share}>שלחו לחבר מהשכבה</button>
          </div>
        </div>
      </section>}
    </main>
  );
}
