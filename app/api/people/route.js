// רשימת האנשים לדשבורד, מ-Pecanify. בלי טלפון ובלי אימייל.
import { allCards, key } from '@/lib/crm';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
const CACHE = { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=300' };
let cache = { at: 0, rows: null };

export async function GET() {
  try {
    if (!key()) return Response.json({ ok: false }, { status: 500 });
    if (cache.rows && Date.now() - cache.at < 30000) return Response.json({ ok: true, people: cache.rows }, { headers: CACHE });
    const cards = await allCards();
    const rows = cards.map((c, i) => {
      const f = c.customFields || {};
      return {
        id: c.id, class_no: +f.class || 0, name: c.name,
        match: ['sure', 'maybe', 'none'].includes(f.match_status) ? f.match_status : 'none',
        in_group: f.custom_field_jo31 === '1' || f.custom_field_jo31 === 1,
        rsvp: f.rsvp || 'unknown', registered: c.leadStatus === 'IN_PROGRESS', claimed_by: null,
      };
    }).filter((r) => r.class_no && r.name);
    if (rows.length) cache = { at: Date.now(), rows };
    return Response.json({ ok: true, people: rows }, { headers: rows.length ? CACHE : {} });
  } catch { return Response.json({ ok: false }, { status: 500 }); }
}
