const SHEET_ID = '1RmMxLdD4-xhKDVKyJI6Rt9G5F7v_hFBZhN-N3CTZ54o';
const SHEET_NAME = 'Sheet1';
const RECIPIENT_EMAIL = 'jesse@hawke.solutions';

function doGet() {
  return buildResponse_({
    source: 'hts-lead-capture',
    status: 'ready'
  });
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  const leadId = params.lead_id || Utilities.getUuid();
  const submittedAt = params.submitted_at || new Date().toISOString();

  const row = [
    submittedAt,
    params.name || '',
    params.phone || '',
    params.business || '',
    params.email || '',
    params.campaign || '',
    params.page_url || '',
    params.referrer || '',
    params.utm_source || '',
    params.utm_medium || '',
    params.utm_campaign || '',
    params.utm_content || '',
    params.utm_term || '',
    params.fbclid || '',
    params.gclid || '',
    'New',
    '',
    leadId
  ];

  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Lead tracker sheet not found.');
    }

    sheet.appendRow(row);
    sendLeadEmail_(params, submittedAt, leadId);

    return buildResponse_({
      source: 'hts-lead-capture',
      status: 'success',
      leadId: leadId
    });
  } catch (error) {
    return buildResponse_({
      source: 'hts-lead-capture',
      status: 'error',
      message: error.message
    });
  }
}

function sendLeadEmail_(params, submittedAt, leadId) {
  const subject = 'New Hawke website lead - ' + (params.business || params.name || leadId);
  const htmlBody = [
    '<h2>New Hawke Tech Solutions lead</h2>',
    '<p><strong>Submitted:</strong> ' + escapeHtml_(submittedAt) + '</p>',
    '<p><strong>Name:</strong> ' + escapeHtml_(params.name || '') + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml_(params.phone || '') + '</p>',
    '<p><strong>Business:</strong> ' + escapeHtml_(params.business || '') + '</p>',
    '<p><strong>Campaign:</strong> ' + escapeHtml_(params.campaign || '') + '</p>',
    '<p><strong>Page URL:</strong> ' + escapeHtml_(params.page_url || '') + '</p>',
    '<p><strong>Referrer:</strong> ' + escapeHtml_(params.referrer || '') + '</p>',
    '<p><strong>UTM Source:</strong> ' + escapeHtml_(params.utm_source || '') + '</p>',
    '<p><strong>UTM Medium:</strong> ' + escapeHtml_(params.utm_medium || '') + '</p>',
    '<p><strong>UTM Campaign:</strong> ' + escapeHtml_(params.utm_campaign || '') + '</p>',
    '<p><strong>UTM Content:</strong> ' + escapeHtml_(params.utm_content || '') + '</p>',
    '<p><strong>UTM Term:</strong> ' + escapeHtml_(params.utm_term || '') + '</p>',
    '<p><strong>FBCLID:</strong> ' + escapeHtml_(params.fbclid || '') + '</p>',
    '<p><strong>GCLID:</strong> ' + escapeHtml_(params.gclid || '') + '</p>',
    '<p><strong>Lead ID:</strong> ' + escapeHtml_(leadId) + '</p>',
    '<p><a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit">Open tracker sheet</a></p>'
  ].join('');

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: 'Hawke Tech Solutions Lead Capture'
  });
}

function buildResponse_(payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>' +
      'window.parent && window.parent.postMessage(' + json + ', "*");' +
    '</script></body></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
