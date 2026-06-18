const SHEET_NAME = 'Sightings';

function doPost(e) {
  const sheet = getSheet();
  const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const savedAt = payload.savedAt || new Date().toISOString();
  const visitorName = String(payload.visitorName || '').trim();
  const birdName = String(payload.name || payload.birdName || '').trim();
  const habitat = String(payload.habitat || '').trim();
  const createdAt = payload.createdAt || '';
  const faceTurn = Number(payload.faceTurn);

  if (payload.action === 'updateFaceTurn') {
    return updateFaceTurn(sheet, payload, faceTurn);
  }

  if (!visitorName || !birdName) {
    return json({ ok: false, error: 'visitorName and birdName are required' });
  }

  sheet.appendRow([
    savedAt,
    visitorName,
    birdName,
    habitat,
    createdAt,
    Number.isFinite(faceTurn) ? faceTurn : ''
  ]);
  return json({ ok: true });
}

function updateFaceTurn(sheet, payload, faceTurn) {
  if (!Number.isFinite(faceTurn)) {
    return json({ ok: false, error: 'faceTurn is required' });
  }

  ensureHeaders(sheet);

  const targetSavedAt = String(payload.savedAt || '');
  const targetCreatedAt = String(payload.createdAt || '');
  const targetOwnerName = String(payload.ownerName || '');
  const targetBirdLabel = String(payload.birdLabel || '');
  const values = sheet.getDataRange().getValues();

  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    const savedAtMatches = targetSavedAt && String(row[0]) === targetSavedAt;
    const createdAtMatches = targetCreatedAt && String(row[4]) === targetCreatedAt;
    const ownerMatches = !targetOwnerName || String(row[1]) === targetOwnerName;
    const birdMatches = !targetBirdLabel || String(row[2]) === targetBirdLabel;

    if ((savedAtMatches || createdAtMatches) && ownerMatches && birdMatches) {
      sheet.getRange(index + 1, 6).setValue(faceTurn);
      return json({ ok: true, updated: true });
    }
  }

  return json({ ok: true, updated: false });
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
      createdAt: row[4],
      faceTurn: row[5]
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

  ensureHeaders(sheet);

  return sheet;
}

function ensureHeaders(sheet) {
  const headers = ['savedAt', 'visitorName', 'birdName', 'habitat', 'createdAt', 'faceTurn'];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  headers.forEach((header, index) => {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
