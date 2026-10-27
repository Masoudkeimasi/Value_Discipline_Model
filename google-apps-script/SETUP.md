# Connect CRMup to your Google Sheet

This is a one-time setup for your Netlify site. Students will not need Google accounts. Keep the spreadsheet private: only you and lecturers you explicitly share it with can read submissions. The website exposes no read endpoint.

## 1. Create your spreadsheet

1. Open https://sheets.new while signed into the Google account you will use as lecturer.
2. Name it **CRMup Team Submissions**. Leave General access set to **Restricted**.
3. In the spreadsheet menu choose **Extensions → Apps Script**.
4. Delete the example `myFunction` code in `Code.gs`.
5. Copy all the code from [Code.gs](./Code.gs) into the editor and save.
6. Select **initialiseCRMup** in the function selector and click **Run**. Complete Google's permission prompts for your own script. If your university blocks personal Apps Script web apps, ask IT for an approved deployment; do not bypass institutional restrictions.
7. Return to the spreadsheet to dismiss the setup message if needed. In Apps Script, open **Project Settings** (gear icon), then **Script properties**. `SPREADSHEET_ID` and `CRMUP_SUBMISSION_TOKEN` will have been created. Keep the token private; you will copy it directly into Netlify, not chat or GitHub.

## 2. Deploy the Google receiver

1. In Apps Script, choose **Deploy → New deployment**.
2. Select the gear beside deployment type and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone** (including people not signed into Google). This allows the Netlify server to reach the script; the script still requires the private token to write. It does not make your spreadsheet public.
5. Click **Deploy**, authorise if requested, and copy the **Web app URL** ending in `/exec`. Do not use the test URL ending in `/dev`.

If your account does not offer **Anyone**, this setup cannot receive anonymous classroom submissions through Netlify. Ask your university IT team whether it permits an approved Apps Script deployment, or use a different backend.

## 3. Add two private settings to Netlify

1. Open your CRMup project at https://app.netlify.com/.
2. Open **Project configuration → Environment variables** (some interfaces call this **Site configuration**).
3. Add the following variables, available to **Functions** in your **Production** deploy context. Do not add a `VITE_` prefix; these values must remain server-side.

| Name | Value |
| --- | --- |
| `GOOGLE_SHEETS_WEB_APP_URL` | The Google Web app URL ending in `/exec` |
| `GOOGLE_SHEETS_SUBMISSION_TOKEN` | The exact `CRMUP_SUBMISSION_TOKEN` value from Apps Script's Script properties |

4. Save the variables. In **Deploys**, choose **Trigger deploy → Deploy site** to make the function settings available. The repository's `netlify.toml` configures the build, function and `/api/submissions` route automatically.

## 4. Verify before using in class

1. Wait for Netlify to mark the new deploy **Published**.
2. Open your site in a private/incognito window and complete one test simulation with a clearly named test team.
3. The review and confirmation dialog should explain that the decisions will go to your lecturer's private Google Sheet.
4. Submit. Wait for **Received in your lecturer’s Google Sheet**, a timestamp and the submission ID. Do not treat a local finalisation or an unconfirmed receipt as a successful upload.
5. Open the spreadsheet. A tab called **Team Submissions** will be created automatically. Confirm exactly one data row with the matching submission ID, team names and decisions. Check the numbers and written justifications.
6. Refresh the website: the receipt should remain visible. PDF and Excel downloads remain available.
7. You may delete the test data row from the sheet before class. Keep the header row intact.

Until this real-account test succeeds, collection is **not verified live**. Automated tests verify the integration code but cannot establish access to your Google account or Netlify configuration.

## What each row contains

A Google receipt timestamp, submission UUID, student submission time in ISO and Europe/London, company, team members, strategy, selling price, all four market facts, £75m budget, project count, expenditure and remaining budget, thirty binary PR01–PR30 selection columns, ID/name/cost for each of the ten projects, both written rationales, and the team-approval flag. All money and selection values are numeric; fulfilment rate is a numeric percentage. No lecturer grading rules or performance scores are sent.

Use Google Sheets **Data → Create a filter**, or download **File → Download → Microsoft Excel** to analyse the complete class. Student-entered text is stored literally to prevent it from being evaluated as a spreadsheet formula.

One row represents one finalised team submission. Browser retries reuse the same UUID; the receiver locks the sheet while checking and adding rows, preventing duplicate rows for that UUID. A team that starts a completely new simulation receives a new UUID and can create another row. There is no shared account-based team identity or enforcement of one attempt per team.

## Retries and troubleshooting

- **Online collection is not configured:** one or both Netlify variables are missing, or the site has not been redeployed since adding them.
- **Receipt not confirmed:** check the Google deployment is accessible to Anyone, runs as you, has the correct `/exec` URL, and the two token values match exactly. Check Apps Script **Executions** for failures. Download the Excel as backup, then use **Retry sending to lecturer** on the same submission. Do not start a new simulation to retry.
- A Google save can succeed even if the reply is lost. A retry uses the same ID and returns the original receipt instead of adding another row.
- If you edit the script later, use **Deploy → Manage deployments → Edit → New version → Deploy**; saving script code alone does not update its deployed version.
- Do not rename/reorder headers or edit submission IDs in the collection tab. If you need analysis columns, use a separate tab so the collection schema remains intact.
- Google Apps Script has per-account execution quotas. Test with your expected classroom workload; it is suitable for ordinary classroom collection, not an unlimited high-volume submission service.

## Local development

`npm run dev` serves the UI only. For local end-to-end function development use Netlify CLI's `netlify dev`, with the two private environment variables configured locally or pulled securely through Netlify. Never commit a token. Plain Vite has no `/api/submissions` receiver, so the UI will report an unconfirmed receipt; downloads continue to work.

`npm test` verifies canonical records, server validation, receipt matching, failures, retry IDs and the Apps Script receiver using a mock spreadsheet. `npm run build` type-checks and builds the site. Actual Google/Netlify activation requires the test above.
