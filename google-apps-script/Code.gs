/** CRMup sheet receiver. Paste into Extensions > Apps Script in your PRIVATE Google Sheet. */
function initialiseCRMup() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Open Apps Script from Extensions in your Google Sheet.');
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  // Generated once and retained on subsequent runs. Never logged or sent to students.
  if (!properties.getProperty('CRMUP_SUBMISSION_TOKEN')) {
    properties.setProperty('CRMUP_SUBMISSION_TOKEN', Utilities.getUuid() + Utilities.getUuid());
  }
  SpreadsheetApp.getUi().alert('CRMup initialised. In Apps Script, open Project Settings > Script properties to copy CRMUP_SUBMISSION_TOKEN into your Netlify environment settings. Keep the token private.');
}

function doPost(e) {
  var lock;
  try {
    var properties = PropertiesService.getScriptProperties();
    var token = properties.getProperty('CRMUP_SUBMISSION_TOKEN');
    var id = properties.getProperty('SPREADSHEET_ID');
    var input = JSON.parse(e.postData.contents);
    if (!token || !id || input.token !== token) return reply_({ ok: false });
    var record = input.record;
    if (!record || typeof record !== 'object' || Array.isArray(record) ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(record.Submission_ID)) return reply_({ ok: false });
    var keys = Object.keys(record);
    if (keys.length !== 78 || keys[0] !== 'Submission_ID' ||
        keys.some(function(k) { return typeof record[k] !== 'string' && typeof record[k] !== 'number'; })) return reply_({ ok: false });
    lock = LockService.getScriptLock();
    lock.waitLock(20000);
    var book = SpreadsheetApp.openById(id);
    var sheet = book.getSheetByName('Team Submissions') || book.insertSheet('Team Submissions');
    var headers = ['Received_At'].concat(keys);
    if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#163b3b').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, headers.length, 170);
    }
    var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (JSON.stringify(current) !== JSON.stringify(headers)) return reply_({ ok: false });
    // The UUID stays unchanged during browser retries. Lock makes check + append atomic.
    if (sheet.getLastRow() > 1) {
      var match = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).createTextFinder(record.Submission_ID).matchEntireCell(true).findNext();
      if (match) return reply_({ ok: true, submissionId: record.Submission_ID, receivedAt: String(sheet.getRange(match.getRow(), 1).getValue()) });
    }
    var receivedAt = new Date().toISOString();
    // User text is stored literally, never interpreted as a spreadsheet formula.
    var values = [receivedAt].concat(keys.map(function(k) {
      var value = record[k];
      return typeof value === 'string' && /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
    }));
    var row = sheet.getLastRow() + 1;
    var range = sheet.getRange(row, 1, 1, headers.length);
    var formats = ['@'].concat(keys.map(function(k) {
      if (typeof record[k] === 'string') return '@';
      if (k === 'Fulfilment_Rate') return '0%';
      return /_GBP$/.test(k) ? '"£"#,##0' : '0';
    }));
    range.setNumberFormats([formats]);
    range.setValues([values]);
    SpreadsheetApp.flush();
    return reply_({ ok: true, submissionId: record.Submission_ID, receivedAt: receivedAt });
  } catch (error) {
    // Do not return tokens, sheet identifiers, student data or internal errors.
    return reply_({ ok: false });
  } finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}
function reply_(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
