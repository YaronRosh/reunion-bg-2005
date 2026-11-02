// קריאה/כתיבה ל-Pecanify מצד השרת בלבד. המפתח נשמר ב-PECANIFY_API_KEY ב-Vercel.
// המשתמש יכול לגעת רק בכרטיס של השם שהוא רשם (נבדק מול Supabase עם הטוקן שלו).
import { BASE, H, key, norm, firstArray, allCards, lastDiag } from '@/lib/crm';

async function myRow(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !token) return null;
  const u = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!u.ok) return null;
  const { id } = await u.json();
  const hdr = { apikey: anon, Authorization: `Bearer ${token}` };
  let r = await fetch(`${url}/rest/v1/people?claimed_by=eq.${id}&select=name,class_no,crm_id&limit=1`, { headers: hdr });
  if (!r.ok) r = await fetch(`${url}/rest/v1/people?claimed_by=eq.${id}&select=name,class_no&limit=1`, { headers: hdr }); // עמודת crm_id עוד לא קיימת
  const rows = r.ok ? await r.json() : [];
  return rows[0] || null;
}

let diag = '';
async function byName(name) {
  const r = await fetch(`${BASE}/search`, { method: 'POST', headers: H(), body: JSON.stringify({ sort: [{ field: 'name', order: 'ASC' }], limit: 50, filter: { name: { type: 'TEXT', operator: 'EQUAL', value: name } } }) });
  const txt = await r.text();
  let j = {}; try { j = JSON.parse(txt); } catch {}
  const list = firstArray(j);
  diag += ` | byName ${r.status} items=${list.length} ${list.length ? '' : txt.slice(0, 150)}`;
  return list;
}
async function findCard(me) {
  if (me.crm_id) {
    const r = await fetch(`${BASE}/${me.crm_id}`, { headers: H() });
    if (r.ok) { const j = await r.json(); const c = j.data || j; if (c && c.id) return c; }
  }
  const hit = await byName(me.name);
  const ok = hit.filter((c) => norm(c.name) === norm(me.name));
  if (ok.length) return ok.find((c) => String(c.customFields?.class ?? c.class) === String(me.class_no)) || ok[0];
  const cards = await allCards();
  const same = cards.filter((c) => norm(c.name) === norm(me.name));
  return same.find((c) => String(c.customFields?.class ?? c.class) === String(me.class_no)) || same[0] || null;
}

const fail = (error, status) => Response.json({ ok: false, error }, { status });

export async function POST(req) {
  try {
    if (!key()) return fail('no key', 500);
    const { action, phone, email, occupation, token } = await req.json();
    const me = await myRow(token);
    if (!me) return fail('unauthorized', 401);
    const card = await findCard(me);
    if (!card) return fail(`card not found (${me.name}) ${lastDiag}${diag}`, 404);
    if (action === 'get') {
      return Response.json({ ok: true, phone: card.phone || '', email: card.email || '', occupation: card.customFields?.career || '' });
    }
    const body = { name: card.name, leadStatus: 'IN_PROGRESS', customFields: { match_status: 'sure', custom_field_jo31: '1' } }; // 'נרשם - בקבוצה'
    if (phone) body.phone = phone;
    if (email) body.email = email;
    if (occupation != null) body.customFields.career = String(occupation).slice(0, 200);
    const r = await fetch(`${BASE}/${card.id}`, { method: 'PUT', headers: H(), body: JSON.stringify(body) });
    const detail = r.ok ? '' : `${r.status} ${(await r.text()).slice(0, 300)}`;
    return Response.json({ ok: r.ok, detail }, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return fail(String(e.message || e), 500);
  }
}
