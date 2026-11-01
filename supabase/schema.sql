-- הרצה אחת ב-Supabase: SQL Editor
create table if not exists people (
  id bigint generated always as identity primary key,
  class_no int not null,            -- 1..10
  class_label text not null,        -- "יב1 - עידית בר"
  name text not null,
  in_group boolean not null default false,
  rsvp text not null default 'unknown' check (rsvp in ('unknown','yes','no','maybe')),
  paid boolean not null default false,
  claimed_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (class_no, name)
);
create table if not exists admins (user_id uuid primary key references auth.users(id));

alter table people enable row level security;
alter table admins enable row level security;

create or replace function is_admin() returns boolean language sql security definer as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- שמות וכיתות גלויים לכולם; טלפונים לא נשמרים כאן בכלל
create policy people_read on people for select using (true);
create policy people_claim on people for update to authenticated
  using (claimed_by is null or claimed_by = auth.uid() or is_admin())
  with check (claimed_by = auth.uid() or is_admin());
create policy people_admin_write on people for all to authenticated
  using (is_admin()) with check (is_admin());
create policy admins_self on admins for select to authenticated using (user_id = auth.uid());
-- להוספת מנהל: insert into admins select id from auth.users where email = 'you@example.com';

-- שדות קשר (נראים רק למנהלים ולבעלים של הרשומה)
alter table people add column if not exists match text not null default 'none'
  check (match in ('sure','maybe','none'));       -- זיהינו / לא בטוח / לא זוהה
create table if not exists contacts (
  person_id bigint primary key references people(id) on delete cascade,
  phone text, email text
);
alter table contacts enable row level security;
create policy contacts_owner on contacts for all to authenticated
  using (is_admin() or exists (select 1 from people p where p.id = person_id and p.claimed_by = auth.uid()))
  with check (is_admin() or exists (select 1 from people p where p.id = person_id and p.claimed_by = auth.uid()));

-- הודעות מהמארגנים
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text not null, body text not null, pinned boolean not null default false,
  created_at timestamptz not null default now()
);
alter table announcements enable row level security;
create policy ann_read on announcements for select using (true);
create policy ann_admin on announcements for all to authenticated using (is_admin()) with check (is_admin());
insert into announcements (title, body, pinned) values
 ('שומרים את התאריך', 'ערב מחזור באזור אפריל, באולם אירועים בנס ציונה. פרטים נוספים בהמשך, ממשיכים לחפש את כולם.', true);
