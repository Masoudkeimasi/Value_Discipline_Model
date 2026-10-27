import type { Draft } from './model';
export type Receipt = { submissionId: string; receivedAt: string };
export async function getCollectionStatus(send: typeof fetch = fetch): Promise<boolean> {
  const response = await send('/api/submissions', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Collection status unavailable.');
  const result = await response.json();
  if (typeof result.enabled !== 'boolean') throw new Error('Collection status unavailable.');
  return result.enabled;
}
export async function deliverSubmission(d: Draft, send: typeof fetch = fetch): Promise<Receipt> {
  if (!d.submission) throw new Error('Finalise your decisions before sending.');
  const response = await send('/api/submissions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: d.company, members: d.members, strategy: d.strategy, selected: d.selected,
      price: d.price, rationale: d.rationale, justification: d.justification, approved: d.approved, submission: d.submission }),
    signal: AbortSignal.timeout(35000),
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true || result.submissionId !== d.submission.id ||
      typeof result.receivedAt !== 'string' || !Number.isFinite(Date.parse(result.receivedAt))) {
    throw new Error('Receipt could not be confirmed. Retry this submission, or download your Excel file as a backup.');
  }
  return { submissionId: result.submissionId, receivedAt: result.receivedAt };
}
