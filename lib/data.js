import { supabase, DEMO } from './supabase';
import { DEMO_PEOPLE, DEMO_ANN } from './demo';

const ls = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export async function getPeople() {
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
export async function sendCode(email) {
  if (DEMO) { ls.set('demo_pending', email); return {}; }
  const { error } = await supabase.auth.signInWithOtp({ email });
  return { error: error?.message };
}
export async function verifyCode(email, code) {
  if (DEMO) { const u = { id: 'demo', email }; ls.set('demo_user', u); return {}; }
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
  return { error: error?.message };
}
export async function signOut() { if (DEMO) ls.set('demo_user', null); else await supabase.auth.signOut(); }
export async function isAdmin(user) {
  if (!user) return false;
  if (DEMO) return true;
  const { data } = await supabase.rpc('is_admin');
  return !!data;
}
export async function claimPerson(person, user, { phone, email, rsvp }) {
  if (DEMO) { const o = ls.get('demo_over', {}); o[person.id] = { claimed_by: user.id, rsvp, match: 'sure', in_group: true }; ls.set('demo_over', o); ls.set('demo_me', person.id); return {}; }
  const { error } = await supabase.from('people').update({ claimed_by: user.id, rsvp, match: 'sure', updated_at: new Date().toISOString() }).eq('id', person.id);
  if (error) return { error: error.message };
  await supabase.from('contacts').upsert({ person_id: person.id, phone, email });
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
