// מסנכרן טלפון ואימייל של נרשמי האתר ישר ללשוניות הכיתות (יב1..יב10):
// טלפון -> עמודה E, אימייל -> עמודה H. לא נוגע בשאר העמודות.
const SUPABASE_URL = 'PUT_URL';
const SUPABASE_KEY = 'PUT_ANON_KEY';
const ORG_CODE = 'PUT_ORGANIZER_CODE';

function sync() {
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/export_people', {
    method: 'post', contentType: 'application/json',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
    payload: JSON.stringify({ p_code: ORG_CODE }), muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error(res.getContentText());
  const rows = JSON.parse(res.getContentText());
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  for (let c = 1; c <= 10; c++) {
    const sh = ss.getSheetByName('יב' + c);
    if (!sh) continue;
    const mine = rows.filter((r) => r.class_no === c);
    if (!mine.length) continue;
    const last = Math.max(sh.getLastRow(), 2);
    const names = sh.getRange(2, 1, last - 1, 1).getValues().map((r) => norm(r[0]));
    const phones = sh.getRange(2, 5, last - 1, 1).getValues();
    const mails = sh.getRange(2, 8, last - 1, 1).getValues();
    if (!sh.getRange(1, 8).getValue()) sh.getRange(1, 8).setValue('אימייל');
    let nextRow = last + 1;
    for (const r of mine) {
      let i = names.indexOf(norm(r.name));
      if (i < 0) { // שם שלא קיים בלשונית: מוסיפים בסוף
        sh.getRange(nextRow, 1).setValue(r.name);
        names.push(norm(r.name)); phones.push(['']); mails.push(['']); i = names.length - 1; nextRow++;
      }
      if (r.phone) phones[i][0] = "'" + r.phone;
      if (r.email) mails[i][0] = r.email;
    }
    sh.getRange(2, 5, phones.length, 1).setValues(phones);
    sh.getRange(2, 8, mails.length, 1).setValues(mails);
  }
}
