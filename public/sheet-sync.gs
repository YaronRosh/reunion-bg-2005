// מסנכרן מהאתר אל לשוניות הכיתות, רק לעמודות פנויות (לא נוגע בעמודות A עד G שמגיעות מנוסחאות):
//   H = אימייל, I = מארגן (V), J = טלפון מהאתר
const SUPABASE_URL = 'PUT_URL';
const SUPABASE_KEY = 'PUT_ANON_KEY';
const ORG_CODE = 'PUT_ORGANIZER_CODE';

function call(fn, payload) {
  return UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'post', contentType: 'application/json',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
    payload: JSON.stringify(payload), muteHttpExceptions: true,
  });
}

function sync() {
  const res = call('export_people', { p_code: ORG_CODE });
  if (res.getResponseCode() !== 200) throw new Error(res.getContentText());
  const rows = JSON.parse(res.getContentText());
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const orgs = [];
  for (let c = 1; c <= 10; c++) {
    const sh = ss.getSheetByName('יב' + c);
    if (!sh) continue;
    const n = Math.max(sh.getLastRow() - 1, 1);
    const names = sh.getRange(2, 1, n, 1).getDisplayValues().map((r) => norm(r[0]));
    const flags = sh.getRange(2, 9, n, 1).getValues();
    names.forEach((nm, i) => { if (nm && String(flags[i][0]).trim().toUpperCase() === 'V') orgs.push({ class_no: c, name: nm }); });
    const mine = rows.filter((r) => r.class_no === c);
    if (!mine.length) continue;
    if (!sh.getRange(1, 8).getValue()) sh.getRange(1, 8).setValue('אימייל');
    if (!sh.getRange(1, 10).getValue()) sh.getRange(1, 10).setValue('טלפון מהאתר');
    for (const r of mine) {
      const i = names.indexOf(norm(r.name));
      if (i < 0) continue;            // לא יוצרים שורות ולא כותבים בשמות
      if (r.email) sh.getRange(i + 2, 8).setValue(r.email);
      if (r.phone) sh.getRange(i + 2, 10).setValue("'" + r.phone);
    }
  }
  call('sync_organizers', { p_code: ORG_CODE, p_list: orgs });
}
