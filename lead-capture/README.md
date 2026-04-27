# Lead Capture Setup

This site now supports direct lead capture instead of relying only on `mailto:`.

## What is already done

- Live tracker sheet created:
  `https://docs.google.com/spreadsheets/d/1RmMxLdD4-xhKDVKyJI6Rt9G5F7v_hFBZhN-N3CTZ54o/edit`
- Tracker columns, frozen header row, and filter are ready.
- The frontend is wired to submit to a direct endpoint when one is configured.
- Localhost now uses the real Apps Script endpoint by default so tracker tests are honest.

## One live step remains

Deploy the Google Apps Script web app, then paste its `/exec` URL into:

`lead-config.js`

Replace:

`endpoint: ''`

with:

`endpoint: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'`

## Fastest deployment path

1. Open the lead tracker sheet:
   `https://docs.google.com/spreadsheets/d/1RmMxLdD4-xhKDVKyJI6Rt9G5F7v_hFBZhN-N3CTZ54o/edit`
2. In the sheet, go to `Extensions` -> `Apps Script`
3. Replace the default code with the contents of:
   `lead-capture/google-apps-script/Code.gs`
4. Set the manifest from:
   `lead-capture/google-apps-script/appsscript.json`
5. Click `Deploy` -> `New deployment`
6. Choose `Web app`
7. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
8. Copy the `/exec` URL
9. Paste it into `lead-config.js`
10. Redeploy the site

## What the live script does

- Appends every submission into the lead tracker sheet
- Emails Jesse immediately at `jesse@hawke.solutions`
- Sends a success message back to the site so the user sees an inline success state

## Local test

On localhost, the site now posts to the live Apps Script endpoint by default.

If you want to test only the form UX without touching the live tracker, open:

`http://localhost:3000/?local_leads=1`

In that mode, submissions post to `/api/leads` and are written to:

`/tmp/hawke-tech-solutions-local-leads.ndjson`

That is only for testing the form UX locally.
