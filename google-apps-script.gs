const SHEET_NAME = 'Sightings';

function doPost(e) {
  const sheet = getSheet();
  const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const savedAt = payload.savedAt || new Date().toISOString();
  const visitorName = String(payload.visitorName || '').trim();
  const birdName = String(payload.name || payload.birdName || '').trim();
  const habitat = String(payload.habitat || '').trim();
  const createdAt = payload.createdAt || '';

  if (!visitorName || !birdName) {
    return json({ ok: false, error: 'visitorName and birdName are required' });
  }

  sheet.appendRow([savedAt, visitorName, birdName, habitat, createdAt]);
  return json({ ok: true });
}

function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  const rows = getSheet()
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((row) => row[1] && row[2])
    .map((row) => ({
      savedAt: row[0],
      visitorName: row[1],
      name: row[2],
      habitat: row[3],
      createdAt: row[4]
    }));

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(rows)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return json(rows);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['savedAt', 'visitorName', 'birdName', 'habitat', 'createdAt']);
  }

  return sheet;
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
