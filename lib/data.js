import { supabase, DEMO } from './supabase';
import { DEMO_PEOPLE, DEMO_ANN } from './demo';
import { parseCsv } from './csv';

const SHEET = process.env.NEXT_PUBLIC_SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj4VAi3k-sdsr-oSYLXz9foWK_cwM9Up2o8Mz99oMjZBwmEP5dBXxG1Z89Ky4nZ2xXHw4UAFWqweCC/pub?gid=200&single=true&output=csv';
async function sheetPeople() {
  try {
    const r = await fetch(SHEET, { cache: 'no-store' });
    const rows = parseCsv(await r.text()).slice(1).filter((x) => x[1]);
    return rows.map((x, i) => ({ id: i + 1, class_no: +x[0], name: x[1], match: x[2] || 'none', in_group: x[2] !== 'none', rsvp: { 'מגיע': 'yes', 'אולי': 'maybe', 'לא מגיע': 'no' }[x[3]] || 'unknown', claimed_by: null }));
  } catch { return null; }
}

const ls = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export async function getPeople() {
  if (SHEET) { const sp = await sheetPeople(); if (sp?.length) return sp; }
  if (DEMO) { const o = ls.get('demo_over', {}); return DEMO_PEOPLE.map((p) => ({ ...p, ...(o[p.id] || {}) })); }
  const { data } = await supabase.from('people').select('id,class_no,name,match,in_group,rsvp,claimed_by').order('class_no').order('name').limit(2000);
  return data || [];
}
export async function getAnnouncements() {
  if (DEMO) return ls.get('demo_ann', DEMO_ANN);
  const { data } = await supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false });
  return data || [];
}
export async function getUser() {
  if (DEMO) return ls.get('demo_user', null);
  const { data } = await supabase.auth.getUser();
  return data?.user ? { id: data.user.id, email: data.user.email } : null;
}
export async function sendCode(email, path = '/join') {
  if (DEMO) { ls.set('demo_user', { id: 'demo', email }); return { demo: true }; }
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + path } });
  return { error: error?.message };
}
export async function verifyCode(email, code) {
  if (DEMO) { const u = { id: 'demo', email }; ls.set('demo_user', u); return {}; }
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
  return { error: error?.message };
}
export function onAuth(cb) { if (DEMO) return () => {}; const { data } = supabase.auth.onAuthStateChange(() => cb()); return () => data.subscription.unsubscribe(); }
export async function signOut() { if (DEMO) ls.set('demo_user', null); else await supabase.auth.signOut(); }
export async function isAdmin(user) {
  if (!user) return false;
  if (DEMO) return true;
  const { data } = await supabase.rpc('is_admin');
  return !!data;
}
export const normPhone = (p) => { const d = (p || '').replace(/\D/g, ''); return d.startsWith('972') ? '0' + d.slice(3) : d; };
export async function claimPerson(person, user, { phone, email, rsvp }) {
  if (DEMO) { const o = ls.get('demo_over', {}); o[person.id] = { claimed_by: user.id, rsvp, match: 'sure', in_group: true }; ls.set('demo_over', o); ls.set('demo_me', person.id); return {}; }
  const { error } = await supabase.from('people').update({ claimed_by: user.id, rsvp, match: 'sure', updated_at: new Date().toISOString() }).eq('id', person.id);
  if (error) return { error: error.message };
  await supabase.from('contacts').upsert({ person_id: person.id, phone: normPhone(phone), email });
  return {};
}
export async function myPerson(user) {
  if (!user) return null;
  if (DEMO) { const id = ls.get('demo_me', null); return id ? (await getPeople()).find((p) => p.id === id) : null; }
  const { data } = await supabase.from('people').select('*').eq('claimed_by', user.id).maybeSingle();
  return data;
}
export async function postAnnouncement(a) {
  if (DEMO) { const l = ls.get('demo_ann', DEMO_ANN); ls.set('demo_ann', [{ id: Date.now(), created_at: new Date().toISOString(), ...a }, ...l]); return {}; }
  const { error } = await supabase.from('announcements').insert(a);
  return { error: error?.message };
}
export async function deleteAnnouncement(id) {
  if (DEMO) { ls.set('demo_ann', ls.get('demo_ann', DEMO_ANN).filter((x) => x.id !== id)); return {}; }
  await supabase.from('announcements').delete().eq('id', id); return {};
}
export async function importRows(rows) {
  if (DEMO) return { error: 'ייבוא זמין רק כשמחוברים ל-Supabase' };
  const { error } = await supabase.from('people').upsert(rows, { onConflict: 'class_no,name' });
  return { error: error?.message };
}
export function stats(people) {
  const t = { total: people.length, sure: 0, maybe: 0, none: 0, yes: 0, maybeR: 0, no: 0 };
  const by = {};
  for (const p of people) {
    t[p.match]++; if (p.rsvp === 'yes') t.yes++; if (p.rsvp === 'maybe') t.maybeR++; if (p.rsvp === 'no') t.no++;
    const c = (by[p.class_no] ||= { total: 0, sure: 0, maybe: 0, none: 0 });
    c.total++; c[p.match]++;
  }
  return { t, by };
}
