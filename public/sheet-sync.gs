// מסנכרן את ההרשמות מהאתר ללשונית "רישום מהאתר" בגיליון. לא נוגע בשאר הלשוניות.
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
  const sh = ss.getSheetByName('רישום מהאתר') || ss.insertSheet('רישום מהאתר');
  const label = { yes: 'מגיע', maybe: 'אולי', no: 'לא מגיע', unknown: '' };
  const out = [['כיתה', 'שם', 'טלפון', 'אימייל', 'עודכן']].concat(rows.map((r) =>
    [r.class_no, r.name, r.phone ? "'" + r.phone : '', r.email || '', r.updated_at]));
  sh.clearContents();
  sh.getRange(1, 1, out.length, 5).setValues(out);
  sh.setRightToLeft(true);
}
