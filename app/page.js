'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPeople, getAnnouncements, stats } from '@/lib/data';
import { Dashboard } from '@/components/ui';

export default function Home() {
  const [people, setPeople] = useState(null);
  const [ann, setAnn] = useState([]);
  useEffect(() => { getPeople().then(setPeople); getAnnouncements().then(setAnn); }, []);
  const { t, by } = stats(people || []);
  const share = () => {
    const text = 'מחזור 2005 בן גוריון: ערב מחזור באזור אפריל בנס ציונה. בואו לוודא שאתם ברשימה ועזרו לנו להגיע לכולם: ' + location.origin;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  return (
    <main>
      <section className="hero">
        <p className="year" aria-hidden="true">2005</p>
        <p className="kicker">פגישת מחזור · בן גוריון · נס ציונה</p>
        <h1>הערב שחיכינו לו, באזור אפריל</h1>
        <p className="lede">ערב אחד, הרבה נוסטלגיה ואנשים שלא ראיתם עשרים שנה. אנחנו עוד מחפשים את כולם, ואתם יכולים לעזור.</p>
        <div className="row">
          <Link href="/join" className="btn">מצאו את עצמכם</Link>
          <Link href="/invite" className="btn ghost">הביאו חבר מהשכבה</Link>
        </div>
      </section>

      {ann.map((a) => (
        <section key={a.id}><div className="card ann">
          {a.pinned && <span className="pin">הודעה מהמארגנים</span>}
          <h3>{a.title}</h3><p>{a.body}</p>
        </div></section>
      ))}

      <section>
        <div className="card">
          <h2>עזרו לנו להגיע לכולם</h2>
          <p className="sub">{people ? `${t.total} אנשים ב-10 כיתות. כל מי שמזהים עוזר לנו להזמין את הכיתה שלו.` : 'טוען...'}</p>
          {people && <Dashboard t={t} by={by} />}
          <div className="row" style={{ marginTop: 20 }}>
            <button className="btn" onClick={share}>שתפו בווטסאפ</button>
          </div>
        </div>
      </section>
    </main>
  );
}
