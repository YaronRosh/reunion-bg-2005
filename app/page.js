'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPeople, getAnnouncements, stats } from '@/lib/data';
import { Dashboard } from '@/components/ui';
import { useAuth } from '@/components/auth';

export default function Home() {
  const { status } = useAuth();
  const inside = status === 'member' || status === 'admin';
  const [people, setPeople] = useState(null);
  const [ann, setAnn] = useState([]);
  useEffect(() => { if (inside) { getPeople().then(setPeople); getAnnouncements().then(setAnn); } }, [inside]);
  const { t, by } = stats(people || []);
  const share = () => {
    const text = 'מחזור 2005 בן גוריון: ערב מחזור באזור אפריל בנס ציונה. בואו לוודא שאתם ברשימה ועזרו לנו להגיע לכולם: ' + location.origin;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  return (
    <main>
      <section className="hero">
        <div className="stage" aria-hidden="true">
          <i className="b b1" /><i className="b b2" /><i className="b b3" /><i className="b b4" /><i className="b b5" /><i className="b b6" />
          <p className="year">2005</p>
        </div>
        <p className="kicker">מחזור 2005 · בן גוריון · נס ציונה</p>
        <h1>נפגשים באפריל.<br />כולם.</h1>
        <p className="lede">ערב אחד עם האנשים שישבו איתכם בכיתה. מוזיקה, כוסית, נוסטלגיה, ותמונת המחזור על המסך. התאריך והאולם נסגרים בקרוב.</p>
        <div className="row">
          {inside ? <Link href="/invite" className="btn">הזמינו חבר מהשכבה</Link> : <Link href="/join" className="btn">{status === 'pending' ? 'בחרו את השם שלכם' : 'התחברו ומצאו את השם שלכם'}</Link>}
        </div>
        <ul className="facts"><li><b>10</b>כיתות</li><li><b>{people ? t.total : '339'}</b>חברים ברשימה</li><li><b>1</b>ערב</li></ul>
      </section>

      {inside && ann.map((a) => (
        <section key={a.id}><div className="card ann">
          {a.pinned && <span className="pin">הודעה מהמארגנים</span>}
          <h3>{a.title}</h3><p>{a.body}</p>
        </div></section>
      ))}

      {!inside && status !== 'loading' && <section><div className="card"><h2>האתר פתוח לבוגרי המחזור</h2><p className="sub">כדי לראות מי כבר כאן, מי עוד חסר ומה קורה בערב, מתחברים עם המייל ובוחרים את השם שלכם מהרשימה. כך אנחנו יודעים שזה באמת אתם.</p><Link href="/join" className="btn">להתחברות</Link></div></section>}

      {inside && <section>
        <div className="card">
          <h2>מי כבר כאן, ומי עוד חסר</h2>
          <p className="sub">{people ? `${t.total} אנשים בעשר כיתות, ${t.sure} כבר זוהו. כל שם שתמצאו הוא עוד אחד שיגיע.` : 'טוען...'}</p>
          {people && <Dashboard t={t} by={by} />}
          <div className="row" style={{ marginTop: 20 }}>
            <button className="btn" onClick={share}>שלחו לחבר מהשכבה</button>
          </div>
        </div>
      </section>}
    </main>
  );
}
