import { BUDGET, projects, strategies } from './data';
import { type Draft, total, validate, londonTime } from './model';
export type SubmissionRecord = Record<string, string | number>;

/** Reconstruct every numeric value from the authoritative catalogue on the server. */
export function buildSubmissionRecord(input: unknown): SubmissionRecord {
  if (!input || typeof input !== 'object') throw new Error('Invalid submission.');
  const raw = input as Partial<Draft>;
  const text = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;
  if (!text(raw.company, 120) || !Array.isArray(raw.members) || raw.members.length > 6 ||
      !raw.members.every(m => text(m, 120)) || !Array.isArray(raw.selected) || raw.selected.length !== 10 ||
      !raw.selected.every(id => text(id, 4)) || !text(raw.price, 20) ||
      !text(raw.rationale, 15000) || !text(raw.justification, 15000) ||
      typeof raw.strategy !== 'string' || raw.approved !== true ||
      !raw.submission || !text(raw.submission.id, 36) ||
      !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(raw.submission.id) ||
      !text(raw.submission.at, 40) || !Number.isFinite(Date.parse(raw.submission.at))) {
    throw new Error('Invalid submission fields.');
  }
  const d = raw as Draft;
  const errors = validate(d, 5);
  if (errors.length) throw new Error(errors.join(' '));
  const s = strategies.find(s => s.id === d.strategy)!;
  const chosen = d.selected.map(id => projects.find(p => p.id === id)!);
  const record: SubmissionRecord = {
    Submission_ID: d.submission!.id,
    Submitted_At: new Date(d.submission!.at).toISOString(),
    Submitted_At_London: londonTime(d.submission!.at),
    Company_Name: d.company.trim(),
    Team_Members: d.members.map(m => m.trim()).join('; '),
    Strategy: s.name,
    Selling_Price_GBP: Number(d.price),
    Potential_Firms: s.market,
    Fulfilment_Rate: s.fulfilmentRate,
    Delivery_Selling_Cost_Per_Signed_Firm_GBP: s.cost,
    Annual_Fixed_Operating_Cost_GBP: s.fixedOperatingCost,
    Project_Budget_GBP: BUDGET,
    Projects_Selected: chosen.length,
    Project_Investment_GBP: total(d.selected),
    Remaining_Project_Budget_GBP: BUDGET - total(d.selected),
  };
  for (const p of projects) record[`${p.id}_Selected`] = d.selected.includes(p.id) ? 1 : 0;
  chosen.forEach((p, i) => {
    record[`Project_${i + 1}_ID`] = p.id;
    record[`Project_${i + 1}_Name`] = p.name;
    record[`Project_${i + 1}_Cost_GBP`] = p.cost;
  });
  record.Pricing_Rationale = d.rationale;
  record.Strategic_Justification = d.justification;
  record.Team_Approved = 1;
  return record;
}
