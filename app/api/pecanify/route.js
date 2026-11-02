// כתיבה ל-Pecanify מצד השרת בלבד. המפתח נשמר ב-PECANIFY_API_KEY ב-Vercel.
const BASE = 'https://www.pecanify.com/api/public/cards/contacts';
const key = () => (process.env.PECANIFY_API_KEY || '').replace(/^Bearer\s+/i, '').trim();
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${key()}` });
const norm = (s) => (s || '').replace(/[\s'׳"״]/g, '').toLowerCase();

async function verifyUser(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !token) return false;
  const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  return r.ok;
}

async function allCards() {
  const out = [];
  for (let page = 0; page < 10; page++) {
    const r = await fetch(`${BASE}/search`, { method: 'POST', headers: H(), body: JSON.stringify({ sort: [{ field: 'name', order: 'ASC' }], limit: 500, offset: page * 500, filter: {} }) });
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data || j.items || j.cards || [];
    out.push(...list);
    if (list.length < 500) break;
  }
  return out;
}

export async function POST(req) {
  try {
    if (!key()) return Response.json({ ok: false, error: 'no key' }, { status: 500 });
    const { name, class_no, phone, email, occupation, token } = await req.json();
    if (!name || !(await verifyUser(token))) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const cards = await allCards();
    const card = cards.find((c) => norm(c.name) === norm(name) && String(c.customFields?.class ?? c.class ?? class_no) === String(class_no))
      || cards.find((c) => norm(c.name) === norm(name));
    if (!card) return Response.json({ ok: false, error: 'card not found' }, { status: 404 });
    const body = { name: card.name };
    if (phone) body.phone = phone;
    if (email) body.email = email;
    if (occupation) body.customFields = { occupation: String(occupation).slice(0, 200) };
    const r = await fetch(`${BASE}/${card.id}`, { method: 'PUT', headers: H(), body: JSON.stringify(body) });
    return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
