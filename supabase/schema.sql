-- רץ אוטומטית בכל build (scripts/migrate.mjs); בטוח להריץ שוב ושוב
create table if not exists people (
  id bigint generated always as identity primary key,
  class_no int not null,
  class_label text not null default '',
  name text not null,
  in_group boolean not null default false,
  match text not null default 'none' check (match in ('sure','maybe','none')),
  rsvp text not null default 'unknown' check (rsvp in ('unknown','yes','no','maybe')),
  paid boolean not null default false,
  claimed_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (class_no, name)
);
create table if not exists admin_emails (email text primary key);
create table if not exists contacts (
  person_id bigint primary key references people(id) on delete cascade,
  phone text, email text
);
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text not null, body text not null, pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean language sql security definer stable as
$$ select exists (select 1 from admin_emails where lower(email) = lower(coalesce(auth.jwt() ->> 'email',''))) $$;

alter table people enable row level security;
alter table admin_emails enable row level security;
alter table contacts enable row level security;
alter table announcements enable row level security;

drop policy if exists people_read on people;
create policy people_read on people for select using (true);
drop policy if exists people_claim on people;
create policy people_claim on people for update to authenticated
  using (claimed_by is null or claimed_by = auth.uid() or is_admin())
  with check (claimed_by = auth.uid() or is_admin());
drop policy if exists people_admin_write on people;
create policy people_admin_write on people for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists contacts_owner on contacts;
create policy contacts_owner on contacts for all to authenticated
  using (is_admin() or exists (select 1 from people p where p.id = person_id and p.claimed_by = auth.uid()))
  with check (is_admin() or exists (select 1 from people p where p.id = person_id and p.claimed_by = auth.uid()));
drop policy if exists ann_read on announcements;
create policy ann_read on announcements for select using (true);
drop policy if exists ann_admin on announcements;
create policy ann_admin on announcements for all to authenticated using (is_admin()) with check (is_admin());

insert into announcements (title, body, pinned)
select 'אפריל, נס ציונה', 'ערב מחזור באולם אירועים בעיר. תאריך ומקום סופיים יפורסמו כאן. עד אז, עזרו לנו למצוא את כולם.', true
where not exists (select 1 from announcements);

-- הרשאות ל-Data API (בטוח גם אם "expose new tables" כבוי); ה-RLS למעלה הוא שמגביל בפועל
grant usage on schema public to anon, authenticated;
grant select on people, announcements to anon, authenticated;
grant update on people to authenticated;
grant insert, update, delete on people, announcements to authenticated;
grant select, insert, update, delete on contacts to authenticated;
grant execute on function is_admin() to anon, authenticated;

-- הרשמה של אדם לפי כיתה ושם (יוצר או מעדכן את הרשומה ושומר טלפון/מייל)
create or replace function claim_person(p_class int, p_name text, p_phone text, p_email text, p_rsvp text)
returns void language plpgsql security definer as $$
declare pid bigint;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  insert into people(class_no, class_label, name, in_group, match, rsvp, claimed_by)
  values (p_class, 'יב' || p_class, p_name, true, 'sure', p_rsvp, auth.uid())
  on conflict (class_no, name) do update
    set claimed_by = auth.uid(), match = 'sure', in_group = true, rsvp = p_rsvp, updated_at = now()
    where people.claimed_by is null or people.claimed_by = auth.uid()
  returning id into pid;
  if pid is null then raise exception 'already claimed'; end if;
  insert into contacts(person_id, phone, email) values (pid, p_phone, p_email)
  on conflict (person_id) do update set phone = excluded.phone, email = excluded.email;
end $$;
grant execute on function claim_person(int, text, text, text, text) to authenticated;
