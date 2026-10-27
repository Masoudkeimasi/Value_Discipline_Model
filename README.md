# CRMup: The Value Discipline Challenge

A responsive, seven-stage classroom strategy simulation built with React, TypeScript, Vite, Tailwind CSS and Lucide. Students register a team, choose a value discipline, invest in exactly ten projects within £75m, price their product, justify their choices and download genuine PDF and XLSX decision packages. No account, database or paid service is required.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

In this cloud workspace, use `npm ci --cache /workspace/.npm-cache` if the default home cache is not writable. The dev server binds to all interfaces on port 5173.

```sh
npm test
npm run build
npm run preview
```

## Deployment

Deploy as a static Vite site to Netlify or Vercel. Use `npm run build` as the build command and `dist` as the output directory. No server functions are needed. Build-time environment variables must be configured before the production build.

## Lecturer email

Optionally create an ignored `.env.local` with `VITE_LECTURER_EMAIL=lecturer@example.edu`, then restart Vite (or rebuild production). This enables a mailto draft button. It does **not** transmit files or attach them automatically; students are instructed to attach the downloaded Excel workbook manually. Leave the variable unset to hide the button. This address is public application configuration, not a secret.

## Editing the simulation

`src/data.ts` contains the budget, three market datasets, all 30 project titles, descriptions, numeric costs and the predetermined mixed display order. Update those values there, then rerun tests. Project IDs must remain unique; the lecturer import schema is currently based on PR01–PR30 and ten selected projects. Changing that structure requires coordinating importer headers and selection rules in `src/model.ts`, `src/exports.ts` and tests. There is no project-strategy answer key or grading logic in this application.

## Structure

- `src/main.tsx`: seven-step interactive interface and accessible controls
- `src/style.css`: responsive visual system and reduced-motion support
- `src/data.ts`: source catalogue, budget and market facts
- `src/model.ts`: draft types, validation, selection, persistence and submission
- `src/exports.ts`: styled ExcelJS workbook and paginated jsPDF report
- `src/model.test.ts`: automated rules, persistence and export verification

## Persistence and submission semantics

Drafts, including team names, remain in localStorage in the current browser. Starting a new simulation clears the draft after confirmation. Submitted company names are reserved, case-insensitively, in sessionStorage for the current browser tab session. This is local uniqueness; different students' browsers do not share a registry. Use a backend classroom session service if shared classroom uniqueness is required. Do not use this initial application to collect sensitive information.

Finalisation assigns a UUID and timestamp. Display and report timestamps use Europe/London. Submissions are local downloadable records, never claims of delivery to the lecturer. No demand, financial performance or alignment scoring is stored or shown. Students submit the files through their lecturer's agreed channel.

The XLSX workbook includes Team Submission, Selected Projects and Lecturer Import. Currency values are numeric cells, all 30 selection indicators are binary, and no concealed formulas or grading data are included. The PDF contains the same company, strategy, investment and rationale information.

Model and exporter modules are separate from UI so a future authenticated submission API, classroom dashboard or simulation rounds can consume validated records without changing the student decision workflow.

## Strategy market data

| Strategy | Potential firms | Fulfilment rate | Delivery + selling cost per signed firm | Annual fixed operating cost |
| --- | ---: | ---: | ---: | ---: |
| Operational Excellence | 80,000 | 75% | £42,000 | £150m |
| Product Leadership | 40,000 | 80% | £110,000 | £170m |
| Customer Intimacy | 10,000 | 90% | £130,000 | £170m |

The shared source is `src/data.ts`: `market`, `fulfilmentRate` (numeric fraction), `cost` (GBP per signed firm), and `fixedOperatingCost` (GBP annually). All four fields appear on the welcome, strategy, pricing and review screens and in PDF and Excel reports. Annual fixed costs are not deducted from the £75m project investment budget. No performance calculations have been added.

The Lecturer Import sheet preserves its original 49 columns and appends `Potential_Firms`, `Fulfilment_Rate`, `Delivery_Selling_Cost_Per_Signed_Firm_GBP` and `Annual_Fixed_Operating_Cost_GBP`. Rates are numeric fractions formatted as percentages; costs remain numeric GBP cells.
