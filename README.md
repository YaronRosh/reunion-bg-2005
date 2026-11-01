# מחזור 2005 בן גוריון

אתר Next.js בעברית. עובד במצב הדגמה בלי הגדרות. לחיבור אמיתי:
1. פרויקט חינמי ב-Supabase, הרצת `supabase/schema.sql` ב-SQL Editor.
2. הגדרת `NEXT_PUBLIC_SUPABASE_URL` ו-`NEXT_PUBLIC_SUPABASE_ANON_KEY` ב-Vercel.
3. הוספת מארגנים: `insert into admins select id from auth.users where email = '...';`
4. ייבוא שמות: בעמוד /admin, העלאת CSV של לשונית "כולם".
