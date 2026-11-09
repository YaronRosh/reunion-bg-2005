// עזרי שרת בלבד ל-API של Pecanify
export const BASE = 'https://www.pecanify.com/api/public/cards/contacts';
export const key = () => (process.env.PECANIFY_API_KEY || '').replace(/^Bearer\s+/i, '').trim();
export const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${key()}` });
export const norm = (s) => (s || '').replace(/[\s'׳"״]/g, '').toLowerCase();

export const firstArray = (j) => {
  if (Array.isArray(j)) return j;
  for (const v of Object.values(j || {})) { const r = Array.isArray(v) ? v : v && typeof v === 'object' ? firstArray(v) : null; if (r) return r; }
  return [];
};
export let lastDiag = '';
export async function allCards() {
  // ה-API מחזיר עד 250 בבקשה, לכן שולפים בסדר עולה ויורד במקביל ומאחדים (מכסה עד 500 כרטיסים)
  const seen = new Map();
  const one = async (order) => {
    const r = await fetch(`${BASE}/search`, { method: 'POST', headers: H(), body: JSON.stringify({ sort: [{ field: 'name', order }], limit: 250, filter: {} }) });
    const txt = await r.text();
    let j = {}; try { j = JSON.parse(txt); } catch {}
    const list = firstArray(j);
    lastDiag = `search ${r.status} items=${list.length}`;
    return list;
  };
  const [asc, desc] = await Promise.all([one('ASC'), one('DESC')]);
  [...asc, ...desc].forEach((c) => seen.set(c.id, c));
  return [...seen.values()];
}
