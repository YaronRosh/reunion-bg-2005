export function parseCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
// עמודות לפי גיליון "כולם": כיתה, שם, בקבוצה, מגיע, שילם, טלפון, הערות, התאמה מהקבוצה
export function toPeople(rows) {
  const out = [];
  for (const r of rows.slice(1)) {
    const m = /יב\s*(\d+)/.exec(r[0] || ''); if (!m || !r[1]) continue;
    const note = r[7] || ''; const inGroup = (r[2] || '').trim() === 'כן';
    const match = /ודאי/.test(note) ? 'sure' : /בינוני|נמוך/.test(note) || inGroup ? 'maybe' : 'none';
    out.push({ class_no: +m[1], class_label: r[0], name: r[1].trim(), in_group: inGroup, match });
  }
  return out;
}
