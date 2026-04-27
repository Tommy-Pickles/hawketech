const leadConfigParams = new URLSearchParams(window.location.search);
const useLocalDevEndpoint = ['1', 'true', 'yes'].includes((leadConfigParams.get('local_leads') || '').toLowerCase());
const liveLeadEndpoint = 'https://script.google.com/macros/s/AKfycbzPGhTu9gxDVsmrRni6ilYK-yFf3A2-ebd1MNwHCJGd2QoISdA-fEj4qlhBNdHtFoTu/exec';

window.HTS_LEAD_CONFIG = {
  // Use the real Apps Script endpoint by default so localhost tests the actual tracker.
  // Add ?local_leads=1 to the URL only when you want the bundled dev endpoint instead.
  endpoint: useLocalDevEndpoint ? '/api/leads' : liveLeadEndpoint,
  fallbackEmail: 'jesse@hawke.solutions',
  trackerSheetId: '1RmMxLdD4-xhKDVKyJI6Rt9G5F7v_hFBZhN-N3CTZ54o',
  trackerSheetUrl: 'https://docs.google.com/spreadsheets/d/1RmMxLdD4-xhKDVKyJI6Rt9G5F7v_hFBZhN-N3CTZ54o/edit'
};
