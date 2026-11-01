// נתוני הדגמה בדויים. האתר עובר לנתונים אמיתיים ברגע שמוגדר Supabase.
const first = ['נועה','איתי','מאיה','דור','שירן','עומר','ליאור','טל','גל','הדר','אורי','רוני'];
const last = ['כהן','לוי','מזרחי','פרץ','ביטון','אברהם','דהן','חיים','שלום','אזולאי'];
const matches = ['sure','sure','sure','maybe','none','none'];
export const DEMO_PEOPLE = Array.from({ length: 120 }, (_, i) => {
  const m = matches[i % matches.length];
  return {
    id: i + 1, class_no: (i % 10) + 1,
    name: `${last[(i * 3) % last.length]} ${first[(i * 5) % first.length]}${i > 40 ? ' ' + (i % 7) : ''}`,
    match: m, in_group: m !== 'none', rsvp: 'unknown', claimed_by: null,
  };
});
export const DEMO_ANN = [{ id: 1, pinned: true, created_at: '2026-11-01',
  title: 'שומרים את התאריך', body: 'ערב מחזור באזור אפריל, באולם אירועים בנס ציונה. פרטים נוספים בהמשך, ממשיכים לחפש את כולם.' }];
