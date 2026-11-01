// חיפוש עמום: כל מילה בשאילתה צריכה להתחיל באחת ממילות השם, בכל סדר.
const norm = (s) => (s || '').toLowerCase().replace(/[׳'"״\-.]/g, ' ').replace(/\s+/g, ' ').trim();
export function searchPeople(people, q, limit = 8) {
  const toks = norm(q).split(' ').filter(Boolean);
  if (!toks.length) return [];
  const out = [];
  for (const p of people) {
    const words = norm(p.name).split(' ');
    let score = 0;
    for (const t of toks) {
      const hit = words.findIndex((w) => w.startsWith(t));
      if (hit < 0) { score = -1; break; }
      score += hit === 0 ? 2 : 1;
    }
    if (score > 0) out.push({ p, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p);
}
